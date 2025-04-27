import db from "../db/db.Config";

interface Resume {
  id?: number;
  user_id: number;
  original_text: string;
  optimized_text?: string;
  feedback?: any;
  created_at?: string;
}

// Get all resumes
const getAllResumes = async (): Promise<Resume[]> => {
  try {
    const allResume = await db.any<Resume>("SELECT * FROM resumes");
    return allResume;
  } catch (err) {
    console.error("Error retrieving resumes", err);
    throw err;
  }
};

// Get one resume
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

// Update resume
const updateResume = async (
  id: number,
  updates: Partial<Resume>
): Promise<Resume | null> => {
  try {
    const { original_text, optimized_text, feedback } = updates;

    const validFeedback = feedback ? JSON.stringify(feedback) : null;

    const updatedResume = await db.one<Resume>(
      `UPDATE resumes 
       SET original_text = COALESCE($1, original_text), 
           optimized_text = COALESCE($2, optimized_text), 
           feedback = COALESCE($3, feedback) 
       WHERE id = $4 
       RETURNING *`,
      [original_text, optimized_text, validFeedback, id]
    );

    return updatedResume;
  } catch (err) {
    console.error("Error updating resume", err);
    throw err;
  }
};

// Create resume
const createResume = async (resume: Resume): Promise<Resume> => {
  try {
    const { user_id, original_text, optimized_text, feedback } = resume;
    const createdResume = await db.one<Resume>(
      `INSERT INTO resumes (user_id, original_text, optimized_text, feedback) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [user_id, original_text, optimized_text, feedback]
    );
    return createdResume;
  } catch (err) {
    console.error("Error creating resume", err);
    throw err;
  }
};

// Delete resume
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
// Get resume by user ID
const getResumesByUserId = async (user_id: number): Promise<Resume[]> => {
  try {
    const resumes = await db.any(
      "SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );
    return resumes;
  } catch (err) {
    console.error("Error retrieving resumes by user_id", err);
    throw err;
  }
};

export {
  getAllResumes,
  getOneResume,
  updateResume,
  createResume,
  deleteResume,
  getResumesByUserId,
};
