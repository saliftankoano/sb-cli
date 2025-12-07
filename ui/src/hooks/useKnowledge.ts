import { useState, useEffect } from "react";
import { fetchKnowledge, type KnowledgeFile } from "@/lib/api";

export function useKnowledge() {
  const [knowledge, setKnowledge] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchKnowledge()
      .then((data) => {
        setKnowledge(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { knowledge, loading, error };
}
