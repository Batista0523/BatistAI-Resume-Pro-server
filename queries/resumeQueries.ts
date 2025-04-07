import db from "../db/db.Config";

interface Resume {
  id?: number;
  user_id: number;
  original_text: string;
  optimized_text?: string;
  feedback?: object;
  is_premium?: boolean;
  created_at?: string;
}

//Get all resume
const getAllResumes = async (): Promise<Resume[]> => {
  try {
    const allResume = await db.any<Resume>("SELECT * FROM resumes");
    return allResume;
  } catch (err) {
    console.error("Error retrieving resumes by user", err);
    throw err;
  }
};
//Get one Resume
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
//Update Resume
const updateResume = async (
  id: number,
  updates: Partial<Resume>
): Promise<Resume | null> => {
  try {
    const { original_text, optimized_text, feedback, is_premium } = updates;
    const updatedResume = await db.one<Resume>(
      "UPDATE resumes SET original_text = COALESCE($1, original_text) , optimized_text = COALESCE($2,optimized_text) ,feedback = COALESCE($3, feedback),is_premium = COALESCE($4,is_premium) WHERE id=$5 RETURNING *",
      [original_text, optimized_text, feedback, is_premium, id]
    );
    return updatedResume;
  } catch (err) {
    console.error("Error updating resume", err);
    throw err;
  }
};
//Create Resume
const createResume = async (resume: Resume): Promise<Resume> => {
  try {
    const { user_id, original_text, optimized_text, feedback, is_premium } =
      resume;
    const createdResume = await db.one<Resume>(
      "INSERT INTO resumes (user_id,original_text,optimized_text,feedback,is_premium) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [user_id, original_text, optimized_text, feedback, is_premium]
    );
    return createdResume;
  } catch (err) {
    console.error("Error creating resume", err);
    throw err;
  }
};

//Delete Resume
const deleteResume = async (id: number): Promise<Resume | null> => {
  try {
    const deletedResume = await db.oneOrNone<Resume>(
      "DELETE FROM resumes WHERE id=$1 RETURNING *",
      [id]
    );
    return deletedResume;
  } catch (err) {
    console.error("Error deleting resume", err);
    throw err;
  }
};

export {
  getAllResumes,
  getOneResume,
  updateResume,
  createResume,
  deleteResume,
};
