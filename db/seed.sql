\c resume;

-- Insert sample users
INSERT INTO users (email, full_name, password_hash) 
VALUES 
  ('john.doe@example.com', 'John Doe', 'hashedpassword123'),
  ('jane.smith@example.com', 'Jane Smith', 'hashedpassword456'),
  ('alex.johnson@example.com', 'Alex Johnson', 'hashedpassword789');

-- Insert sample resumes
INSERT INTO resumes (user_id, original_text, optimized_text, feedback, is_premium) 
VALUES 
  (1, 'This is the original text of John Doe''s resume.', 'This is the optimized version of John Doe''s resume.', '{"suggestions": ["Improve summary", "Add skills section"]}', FALSE),
  (2, 'This is the original text of Jane Smith''s resume.', 'This is the optimized version of Jane Smith''s resume.', '{"suggestions": ["Clarify job experience", "Highlight achievements"]}', TRUE),
  (3, 'This is the original text of Alex Johnson''s resume.', 'This is the optimized version of Alex Johnson''s resume.', '{"suggestions": ["Make skills more specific", "Use action verbs"]}', FALSE);

-- Insert sample payments
INSERT INTO payments (user_id, amount, currency, stripe_payment_intent_id, status) 
VALUES 
  (1, 29.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0J', 'completed'),
  (2, 59.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0K', 'completed'),
  (3, 19.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0L', 'pending');
