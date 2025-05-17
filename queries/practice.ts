import db from "../db/db.Config";

interface Resume {
  id?: number;
  user_id: number;
  original_text: string;
  optimized_text: string;
  feedback?: any;
  created_at: string;
}

//get all resume
const getAllResume = async (): Promise<Resume[]> => {
  try {
    const allResume = await db.any<Resume>("SELECT * FROM resumes");
    return allResume;
  } catch (err) {
    console.error("Error retrieving resume", err);
    throw err;
  }
};

const getOneResume = async (id: number): Promise<Resume | null> => {
  try {
    const oneResume = await db.one<Resume>(
      "SELECT * FROM resumes WHERE id=$1",
      [id]
    );
    return oneResume;
  } catch (err) {
    console.error("Error retrieving one resume", err);
    throw err;
  }
};
