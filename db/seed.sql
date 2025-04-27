\c resume;


INSERT INTO users (email, full_name, password_hash, is_premium) 
VALUES 
  ('charles.adams@example.com', 'Charles Adams', 'hashedpassword001', FALSE),
  ('mary.jones@example.com', 'Mary Jones', 'hashedpassword002', FALSE),
  ('paul.taylor@example.com', 'Paul Taylor', 'hashedpassword003', FALSE),
  ('lucy.martin@example.com', 'Lucy Martin', 'hashedpassword004', FALSE),
  ('robert.moore@example.com', 'Robert Moore', 'hashedpassword005', FALSE),
  ('clara.davis@example.com', 'Clara Davis', 'hashedpassword006', FALSE),
  ('john.wilson@example.com', 'John Wilson', 'hashedpassword007', FALSE),
  ('nancy.martinez@example.com', 'Nancy Martinez', 'hashedpassword008', FALSE),
  ('thomas.lee@example.com', 'Thomas Lee', 'hashedpassword009', TRUE),
  ('lily.garcia@example.com', 'Lily Garcia', 'hashedpassword010', TRUE);


INSERT INTO resumes (user_id, original_text, optimized_text, feedback) 
VALUES 
  (1, 'This is the original text of John Doe''s resume.', 'This is the optimized version of John Doe''s resume.', '{"suggestions": ["Improve summary", "Add skills section"]}'),
  (2, 'This is the original text of Jane Smith''s resume.', 'This is the optimized version of Jane Smith''s resume.', '{"suggestions": ["Clarify job experience", "Highlight achievements"]}'),
  (3, 'This is the original text of Alex Johnson''s resume.', 'This is the optimized version of Alex Johnson''s resume.', '{"suggestions": ["Make skills more specific", "Use action verbs"]}');


INSERT INTO payments (user_id, amount, currency, stripe_payment_intent_id, status, metadata) 
VALUES 
  (1, 29.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0J', 'completed', '{"plan": "basic"}'),
  (2, 59.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0K', 'completed', '{"plan": "premium"}'),
  (3, 19.99, 'usd', 'pi_1Gq4g2C2F1JdmlU1D9JY1f0L', 'pending', '{"plan": "trial"}');
