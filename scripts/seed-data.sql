-- Seed data for StayFinder

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, is_verified) VALUES
('sarah.johnson@email.com', '$2b$10$example_hash_1', 'Sarah', 'Johnson', '+1-555-0101', 'host', TRUE),
('mike.chen@email.com', '$2b$10$example_hash_2', 'Mike', 'Chen', '+1-555-0102', 'host', TRUE),
('elena.rodriguez@email.com', '$2b$10$example_hash_3', 'Elena', 'Rodriguez', '+1-555-0103', 'host', TRUE),
('david.wilson@email.com', '$2b$10$example_hash_4', 'David', 'Wilson', '+1-555-0104', 'host', TRUE),
('anna.kim@email.com', '$2b$10$example_hash_5', 'Anna', 'Kim', '+1-555-0105', 'host', TRUE),
('robert.taylor@email.com', '$2b$10$example_hash_6', 'Robert', 'Taylor', '+1-555-0106', 'host', TRUE),
('john.smith@email.com', '$2b$10$example_hash_7', 'John', 'Smith', '+1-555-0107', 'guest', TRUE),
('emily.davis@email.com', '$2b$10$example_hash_8', 'Emily', 'Davis', '+1-555-0108', 'guest', TRUE),
('michael.johnson@email.com', '$2b$10$example_hash_9', 'Michael', 'Johnson', '+1-555-0109', 'guest', TRUE);

-- Insert sample properties
INSERT INTO properties (host_id, title, description, property_type, address, city, state, country, postal_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, amenities, house_rules) VALUES
(1, 'Modern Downtown Apartment', 'Beautiful modern apartment in the heart of downtown. Perfect for business travelers or couples looking to explore the city.', 'Apartment', '123 Main St', 'New York', 'NY', 'USA', '10001', 40.7128, -74.0060, 150.00, 4, 2, 1, ARRAY['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Washer'], ARRAY['No smoking', 'No pets', 'Check-in: 3:00 PM']),
(2, 'Cozy Beach House', 'Stunning beachfront property with panoramic ocean views. Wake up to the sound of waves and enjoy direct beach access.', 'House', '456 Ocean Drive', 'Malibu', 'CA', 'USA', '90265', 34.0259, -118.7798, 280.00, 6, 3, 2, ARRAY['WiFi', 'Kitchen', 'Beach access', 'Parking', 'Hot tub'], ARRAY['No smoking', 'No parties', 'Check-out: 11:00 AM']),
(3, 'Luxury Villa with Pool', 'Spectacular luxury villa featuring a private pool, spa, and breathtaking city views. Perfect for special occasions.', 'Villa', '789 Hill Crest', 'Miami', 'FL', 'USA', '33101', 25.7617, -80.1918, 450.00, 8, 4, 3, ARRAY['WiFi', 'Kitchen', 'Pool', 'Spa', 'Gym', 'Parking'], ARRAY['No smoking', 'No pets', 'Quiet hours: 10 PM - 8 AM']),
(4, 'Mountain Cabin Retreat', 'Rustic mountain cabin surrounded by nature. Perfect for hiking enthusiasts and those seeking tranquility.', 'Cabin', '321 Pine Ridge', 'Aspen', 'CO', 'USA', '81611', 39.1911, -106.8175, 200.00, 4, 2, 1, ARRAY['WiFi', 'Kitchen', 'Fireplace', 'Hiking trails', 'Parking'], ARRAY['No smoking', 'Pet-friendly', 'Check-in: 4:00 PM']),
(5, 'Urban Loft Studio', 'Stylish loft in the heart of the city. Modern amenities and walking distance to major attractions.', 'Loft', '654 Market St', 'San Francisco', 'CA', 'USA', '94102', 37.7749, -122.4194, 120.00, 2, 1, 1, ARRAY['WiFi', 'Kitchen', 'Air conditioning', 'Gym access'], ARRAY['No smoking', 'No pets', 'Quiet building']),
(6, 'Historic Townhouse', 'Charming historic townhouse with modern updates. Experience the citys rich history while enjoying contemporary comfort.', 'Townhouse', '987 Beacon St', 'Boston', 'MA', 'USA', '02108', 42.3601, -71.0589, 180.00, 5, 3, 2, ARRAY['WiFi', 'Kitchen', 'Parking', 'Garden', 'Washer'], ARRAY['No smoking', 'No parties', 'Respect neighbors']);

-- Insert property images
INSERT INTO property_images (property_id, image_url, alt_text, is_primary, display_order) VALUES
(1, '/placeholder.svg?height=400&width=600', 'Modern Downtown Apartment - Living Room', TRUE, 1),
(1, '/placeholder.svg?height=400&width=600', 'Modern Downtown Apartment - Bedroom', FALSE, 2),
(1, '/placeholder.svg?height=400&width=600', 'Modern Downtown Apartment - Kitchen', FALSE, 3),
(2, '/placeholder.svg?height=400&width=600', 'Cozy Beach House - Ocean View', TRUE, 1),
(2, '/placeholder.svg?height=400&width=600', 'Cozy Beach House - Living Area', FALSE, 2),
(2, '/placeholder.svg?height=400&width=600', 'Cozy Beach House - Beach Access', FALSE, 3),
(3, '/placeholder.svg?height=400&width=600', 'Luxury Villa - Pool Area', TRUE, 1),
(3, '/placeholder.svg?height=400&width=600', 'Luxury Villa - Master Bedroom', FALSE, 2),
(3, '/placeholder.svg?height=400&width=600', 'Luxury Villa - City View', FALSE, 3),
(4, '/placeholder.svg?height=400&width=600', 'Mountain Cabin - Exterior', TRUE, 1),
(4, '/placeholder.svg?height=400&width=600', 'Mountain Cabin - Living Room', FALSE, 2),
(4, '/placeholder.svg?height=400&width=600', 'Mountain Cabin - Mountain View', FALSE, 3),
(5, '/placeholder.svg?height=400&width=600', 'Urban Loft - Main Area', TRUE, 1),
(5, '/placeholder.svg?height=400&width=600', 'Urban Loft - Kitchen', FALSE, 2),
(6, '/placeholder.svg?height=400&width=600', 'Historic Townhouse - Facade', TRUE, 1),
(6, '/placeholder.svg?height=400&width=600', 'Historic Townhouse - Interior', FALSE, 2);

-- Insert sample bookings
INSERT INTO bookings (property_id, guest_id, check_in_date, check_out_date, num_guests, total_amount, booking_status, payment_status) VALUES
(1, 7, '2024-03-15', '2024-03-18', 2, 450.00, 'confirmed', 'paid'),
(2, 8, '2024-03-20', '2024-03-25', 4, 1400.00, 'confirmed', 'paid'),
(4, 9, '2024-03-22', '2024-03-24', 2, 400.00, 'confirmed', 'paid'),
(1, 8, '2024-04-10', '2024-04-13', 2, 450.00, 'pending', 'pending'),
(3, 7, '2024-04-15', '2024-04-18', 6, 1350.00, 'confirmed', 'paid');

-- Insert sample reviews
INSERT INTO reviews (booking_id, reviewer_id, property_id, rating, comment, cleanliness_rating, accuracy_rating, communication_rating, location_rating, value_rating, checkin_rating) VALUES
(1, 7, 1, 5, 'Amazing place! The location was perfect and the host was very responsive. Would definitely stay again.', 5, 5, 5, 5, 4, 5),
(2, 8, 2, 5, 'Clean, comfortable, and exactly as described. Great communication from the host.', 5, 5, 5, 5, 5, 5),
(3, 9, 4, 4, 'Nice cabin in a great location. Only minor issue was the WiFi was a bit slow.', 4, 4, 4, 5, 4, 4);

-- Insert sample messages
INSERT INTO messages (booking_id, sender_id, receiver_id, message_text, is_read) VALUES
(1, 7, 1, 'Hi Sarah, looking forward to our stay! What time is check-in?', TRUE),
(1, 1, 7, 'Hello John! Check-in is anytime after 3 PM. I''ll send you the door code closer to your arrival date.', TRUE),
(2, 8, 2, 'Thank you for the wonderful stay! Everything was perfect.', TRUE),
(2, 2, 8, 'So glad you enjoyed it Emily! You''re welcome back anytime.', FALSE);

-- Insert sample favorites
INSERT INTO favorites (user_id, property_id) VALUES
(7, 2),
(7, 3),
(8, 1),
(8, 4),
(9, 2),
(9, 6);
