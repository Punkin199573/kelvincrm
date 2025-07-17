-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, featured, tier_visibility) VALUES
('Kelvin Creekman T-Shirt', 'Official band t-shirt with exclusive design', 29.99, 'apparel', '/merch/kelvin-tshirt.webp', true, ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage']),
('Limited Edition Beanie', 'Warm beanie with embroidered logo', 24.99, 'apparel', '/merch/beanie.jpg', true, ARRAY['blizzard_vip', 'avalanche_backstage']),
('Coffee Mug - Black', 'Premium ceramic mug in black', 19.99, 'accessories', '/merch/mug-black.webp', false, ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage']),
('Coffee Mug - White', 'Premium ceramic mug in white', 19.99, 'accessories', '/merch/mug-white.webp', false, ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage']),
('Exclusive Notepad', 'Limited edition notepad for VIP members', 14.99, 'accessories', '/merch/notepad.webp', false, ARRAY['avalanche_backstage']),
('Collector Pin', 'Exclusive collector pin', 9.99, 'collectibles', '/merch/pin.webp', true, ARRAY['blizzard_vip', 'avalanche_backstage']);

-- Insert sample events
INSERT INTO events (title, description, event_type, start_date, location, price, max_attendees, image_url, is_exclusive, required_tier) VALUES
('Rock Night Live', 'Exclusive live performance for VIP members', 'concert', NOW() + INTERVAL '30 days', 'The Rock Venue, Nashville', 75.00, 100, '/placeholder.jpg', true, 'blizzard_vip'),
('Meet & Greet Session', 'Personal meet and greet with Kelvin', 'meet_greet', NOW() + INTERVAL '15 days', 'Studio Downtown', 150.00, 20, '/placeholder.jpg', true, 'avalanche_backstage'),
('Virtual Q&A', 'Live virtual Q&A session', 'virtual', NOW() + INTERVAL '7 days', NULL, 25.00, 200, '/placeholder.jpg', false, 'frost_fan');

-- Insert sample content
INSERT INTO content (title, description, content_type, content_url, thumbnail_url, required_tier, is_featured) VALUES
('Behind the Scenes: Studio Session', 'Exclusive footage from our latest recording session', 'video', '/placeholder.jpg', '/placeholder.jpg', 'blizzard_vip', true),
('Acoustic Version: Thunder Road', 'Stripped down acoustic performance', 'video', '/placeholder.jpg', '/placeholder.jpg', 'avalanche_backstage', true),
('Demo Track: Electric Dreams', 'Unreleased demo track', 'audio', '/placeholder.jpg', '/placeholder.jpg', 'frost_fan', false);

-- Insert default website settings
INSERT INTO website_settings (key, value, description) VALUES
('site_title', '"Kelvin Creekman Fan Club"', 'Main site title'),
('hero_title', '"Welcome to the Kelvin Creekman Fan Club"', 'Hero section title'),
('hero_subtitle', '"Join the ultimate rock and metal experience"', 'Hero section subtitle'),
('contact_email', '"info@kelvincrm.com"', 'Contact email address'),
('social_links', '{"instagram": "https://www.instagram.com/kelvincrm", "tiktok": "https://www.tiktok.com/@kelvincrm"}', 'Social media links');

-- Insert default images
INSERT INTO images (name, url, category, alt_text) VALUES
('Hero Background', '/placeholder.jpg', 'homepage', 'Hero section background image'),
('About Section', '/placeholder.jpg', 'homepage', 'About section image'),
('Events Banner', '/placeholder.jpg', 'events', 'Events page banner'),
('Store Banner', '/placeholder.jpg', 'store', 'Store page banner'),
('Community Header', '/placeholder.jpg', 'community', 'Community page header');
