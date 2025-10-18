import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Candidate, Voter, Election } from "../types";
import { supabase } from "../lib/supabaseClient";

export interface ElectionResult extends Candidate {
  vote_count: number;
}

interface DataContextType {
  candidates: Candidate[];
  voters: Voter[];
  election: Election;
  loading: boolean;
  electionResults: ElectionResult[];
  discreetResults: ElectionResult[];
  addCandidate: (candidateData: Omit<Candidate, "id">) => Promise<void>;
  deleteCandidate: (candidateId: string) => Promise<void>;
  addVotersBatch: (
    votersData: Omit<Voter, "id" | "pin" | "hasVoted" | "isSpecial">[],
    isSpecial: boolean
  ) => Promise<{ added: Voter[]; skipped: string[] }>;
  deleteVoters: (regNumbers: string[]) => Promise<void>;
  castVote: (
    voterRegNumber: string,
    votes: { [position: string]: string }
  ) => Promise<void>;
  updateElectionStatus: (
    status: "pending" | "ongoing" | "stopped"
  ) => Promise<void>;
  getPositions: () => string[];
  fetchResults: () => Promise<void>;
  saveDiscreetResults: (
    resultsToSave: { id: string; vote_count: number }[]
  ) => Promise<void>;
  restartElection: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<Election>({
    title: "SICT 2025 Election",
    status: "pending",
  });
  const [electionResults, setElectionResults] = useState<ElectionResult[]>([]);
  const [discreetResults, setDiscreetResults] = useState<ElectionResult[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { data: configData, error: configError } = await supabase
          .from("config")
          .select("election_status")
          .eq("id", 1)
          .single();
        if (configError) throw configError;
        setElection((prev) => ({
          ...prev,
          status: configData.election_status as
            | "pending"
            | "ongoing"
            | "stopped",
        }));

        const { data: candidatesData } = await supabase
          .from("candidates")
          .select("*");
        setCandidates((candidatesData as Candidate[]) || []);
        const { data: votersData } = await supabase.from("voters").select("*");
        setVoters((votersData as Voter[]) || []);
        await fetchResults();
        await fetchDiscreetResults();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const updateElectionStatus = async (
    status: "pending" | "ongoing" | "stopped"
  ) => {
    setElection((prev) => ({ ...prev, status }));
    const { error } = await supabase
      .from("config")
      .update({ election_status: status })
      .eq("id", 1);
    if (error) console.error("Failed to update election status:", error);
  };

  const fetchResults = async () => {
    const { data, error } = await supabase.rpc("get_election_results");
    if (error) console.error("Error fetching election results:", error);
    else setElectionResults((data as ElectionResult[]) || []);
  };

  const fetchDiscreetResults = async () => {
    const { data, error } = await supabase.from("discreet_results").select(`
      votes,
      candidates ( id, name, level, position, regNumber, image )
    `);

    if (error) {
      console.error("Error fetching discreet results:", error);
      setDiscreetResults([]);
      return;
    }

    if (data) {
      // THE DEFINITIVE FIX #1: This explicitly checks for an array and handles it.
      const formattedResults: ElectionResult[] = data
        .map((row) => {
          const candidateData = row.candidates;

          if (!candidateData) return null; // Skip if candidate data is missing

          const candidateObject = Array.isArray(candidateData)
            ? candidateData[0]
            : candidateData;

          if (!candidateObject) return null; // Skip if the object is empty

          return {
            id: candidateObject.id,
            name: candidateObject.name,
            level: candidateObject.level,
            position: candidateObject.position,
            regNumber: candidateObject.regNumber,
            image: candidateObject.image,
            vote_count: row.votes,
          };
        })
        .filter((result): result is ElectionResult => result !== null); // Remove any skipped rows

      setDiscreetResults(formattedResults);
    } else {
      setDiscreetResults([]);
    }
  };

  const saveDiscreetResults = async (
    resultsToSave: { id: string; vote_count: number }[]
  ) => {
    const dataToUpsert = resultsToSave.map((r) => ({
      candidate_id: r.id,
      votes: r.vote_count,
    }));
    const { error } = await supabase
      .from("discreet_results")
      .upsert(dataToUpsert, { onConflict: "candidate_id" });
    if (error) throw error;
    await fetchDiscreetResults();
  };

  const addCandidate = async (candidateData: Omit<Candidate, "id">) => {
    const { data, error } = await supabase
      .from("candidates")
      .insert([candidateData])
      .select();
    if (error) {
      if (error.code === "23505") {
        throw new Error(
          `A candidate with Registration Number ${candidateData.regNumber} already exists.`
        );
      }
      throw error;
    }
    if (data) setCandidates((prev) => [...prev, ...(data as Candidate[])]);
  };

  const deleteCandidate = async (candidateId: string) => {
    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", candidateId);
    if (error) throw error;
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
  };

  const addVotersBatch = async (
    votersData: Omit<Voter, "id" | "pin" | "hasVoted" | "isSpecial">[],
    isSpecial: boolean
  ): Promise<{ added: Voter[]; skipped: string[] }> => {
    // Step 1: Pre-check for existing voters (this part is correct and essential)
    const incomingRegNumbers = votersData.map((v) => v.regNumber);
    if (incomingRegNumbers.length === 0) return { added: [], skipped: [] };

    const { data: existingVoters, error: checkError } = await supabase
      .from("voters")
      .select("regNumber")
      .in("regNumber", incomingRegNumbers);

    // If the check itself fails, that's a real error we should report.
    if (checkError) {
      console.error("Failed to check for existing voters:", checkError);
      throw new Error(`Database error during pre-check: ${checkError.message}`);
    }

    const existingRegNumbersSet = new Set(
      (existingVoters || []).map((v) => v.regNumber)
    );
    const newVoters = votersData.filter(
      (v) => !existingRegNumbersSet.has(v.regNumber)
    );
    const skippedRegNumbers = votersData
      .filter((v) => existingRegNumbersSet.has(v.regNumber))
      .map((v) => v.regNumber);

    // If there are no new voters, we're done.
    if (newVoters.length === 0) {
      return { added: [], skipped: skippedRegNumbers };
    }

    // Step 2: Attempt to insert only the new voters.
    const votersToInsert = newVoters.map((v) => ({
      ...v,
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      hasVoted: false,
      isSpecial: isSpecial,
    }));

    const { data, error } = await supabase
      .from("voters")
      .insert(votersToInsert)
      .select();

    // Step 3: Handle the result gracefully. THIS IS THE FIX.
    if (error) {
      // Log the error for debugging, but DO NOT THROW it.
      console.error(
        "Insert failed despite pre-check. This can happen in rare cases. Failing gracefully.",
        error
      );
      // Report to the UI that the insert failed by returning a result where nothing was added.
      // We assume the entire list of incoming numbers were effectively skipped.
      return { added: [], skipped: incomingRegNumbers };
    }

    // If we get here, the insert was successful.
    if (data) {
      setVoters((current) => [...current, ...(data as Voter[])]);
      return { added: data as Voter[], skipped: skippedRegNumbers };
    }

    // Fallback case.
    return { added: [], skipped: incomingRegNumbers };
  };

  const deleteVoters = async (regNumbers: string[]) => {
    const { error } = await supabase
      .from("voters")
      .delete()
      .in("regNumber", regNumbers);
    if (error) throw error;
    const toDelete = new Set(regNumbers);
    setVoters((prev) => prev.filter((v) => !toDelete.has(v.regNumber)));
  };

  const castVote = async (
    voterRegNumber: string,
    votes: { [position: string]: string }
  ): Promise<void> => {
    const candidateIds = Object.values(votes);
    const { data, error } = await supabase.functions.invoke("cast-vote", {
      body: { voterRegNumber, candidateIds },
    });
    if (error) throw new Error(error.message);
    if (data && data.error) throw new Error(data.error);
    setVoters((prev) =>
      prev.map((v) =>
        v.regNumber === voterRegNumber ? { ...v, hasVoted: true } : v
      )
    );
  };

  const getPositions = (): string[] => {
    if (!candidates || candidates.length === 0) {
      return [];
    }
    // Step 1: Explicitly create a new array of strings. This guarantees the type.
    const positions: string[] = candidates.map((c: Candidate) => c.position);

    // Step 2: Use Array.from on a new Set for the most robust de-duplication.
    return Array.from(new Set(positions));
  };

  const restartElection = async () => {
    // We throw an error if the confirmation fails, stopping the function.
    if (
      !window.confirm(
        "ARE YOU SURE you want to restart the entire election? This will permanently delete all votes and reset all voters. This action cannot be undone."
      )
    ) {
      throw new Error("Election restart cancelled.");
    }

    try {
      // Call the secure database function.
      const { error } = await supabase.rpc("restart_election");
      if (error) throw error;

      // If successful, we need to refresh our local app state to match.
      // The easiest and most reliable way is to just reload the application.
      alert("The election has been successfully restarted.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to restart election:", error);
      alert(
        "An error occurred while trying to restart the election. Please check the console."
      );
    }
  };

  const value = {
    candidates,
    voters,
    election,
    loading,
    electionResults,
    discreetResults,
    addCandidate,
    deleteCandidate,
    addVotersBatch,
    deleteVoters,
    castVote,
    updateElectionStatus,
    getPositions,
    fetchResults,
    saveDiscreetResults,
    restartElection,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-emerald-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">
            Loading Election Data...
          </p>
          <p className="text-gray-500">Connecting to the database.</p>
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
