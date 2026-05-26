import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export function useCommentParser() {
  const [parsing, setParsing] = useState(false);

  async function parseComment(text) {
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-comment", {
        body: { text },
      });
      if (error) throw error;
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    } finally {
      setParsing(false);
    }
  }

  return { parseComment, parsing };
}
