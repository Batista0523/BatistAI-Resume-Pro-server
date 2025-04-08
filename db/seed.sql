\c resume;

-- Insert sample users
INSERT INTO users (email, full_name, password_hash, is_premium) 
VALUES 
  ('john.doe@example.com', 'John Doe', 'hashedpassword123', FALSE),
  ('jane.smith@example.com', 'Jane Smith', 'hashedpassword456', TRUE),
  ('alex.johnson@example.com', 'Alex Johnson', 'hashedpassword789', FALSE);

-- Insert sample resumes
INSERT INTO resumes (user_id, original_text, optimized_text, feedback) 
VALUES 
  (1, 'This is the original text of John Doe''s resume.', 'This is the optimized version of John Doe''s resume.', '{"suggestions": ["Improve summary", "Add skills section"]}'),
  (2, 'This is the original text of Jane Smith''s resume.', 'This is the optimized version of Jane Smith''s resume.', '{"suggestions": ["Clarify job experience", "Highlight achievements"]}'),
  (3, 'This is the original text of Alex Johnson''s resume.', 'This is the optimized version of Alex Johnson''s resume.', '{"suggestions": ["Make skills more specific", "Use action verbs"]}');

-- Insert sample payments
INSERT INTO payments (user_id, amount, currency, stripe_payment_intent_id, status, metadata) 
VALUES 
  (1, 29.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0J', 'completed', '{"plan": "basic"}'),
  (2, 59.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0K', 'completed', '{"plan": "premium"}'),
  (3, 19.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0L', 'pending', '{"plan": "trial"}');
