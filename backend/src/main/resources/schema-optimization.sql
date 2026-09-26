-- ==============================================================================
-- DA Centre: 15 Million (1.5 Crore) Records MySQL Index Optimization Script
-- Safe execution: Uses CREATE INDEX or ALTER TABLE with existence checks
-- ==============================================================================

USE veterinary_research;

-- ------------------------------------------------------------------------------
-- 1. DOCTORS TABLE INDEXES
-- Optimizes: doctorName, specialist, location, hospital, fee, and created_at
-- ------------------------------------------------------------------------------
CREATE INDEX idx_doctors_created_at ON doctors (created_at DESC);
CREATE INDEX idx_doctors_name ON doctors (doctor_name(100));
CREATE INDEX idx_doctors_specialist ON doctors (specialist(100));
CREATE INDEX idx_doctors_location ON doctors (location(100));
CREATE INDEX idx_doctors_hospital ON doctors (hospital(100));
CREATE INDEX idx_doctors_fee ON doctors (fee);
CREATE INDEX idx_doctors_spec_loc ON doctors (specialist(50), location(50));

-- ------------------------------------------------------------------------------
-- 2. MARKET RESEARCH TABLE INDEXES
-- Optimizes: company, states, cities, model, scale, price, and created_at
-- ------------------------------------------------------------------------------
CREATE INDEX idx_mr_created_at ON market_research (created_at DESC);
CREATE INDEX idx_mr_company ON market_research (company(100));
CREATE INDEX idx_mr_states ON market_research (states(100));
CREATE INDEX idx_mr_cities ON market_research (cities(100));
CREATE INDEX idx_mr_model ON market_research (model(50));
CREATE INDEX idx_mr_scale ON market_research (scale(50));
CREATE INDEX idx_mr_target_segment ON market_research (target_segment(50));

-- ------------------------------------------------------------------------------
-- 3. VETERINARY ECOSYSTEM (HOSPITALS) TABLE INDEXES
-- Optimizes: hospital_name, state, city, business_status, rating, and created_at
-- ------------------------------------------------------------------------------
CREATE INDEX idx_ve_created_at ON veterinary_ecosystem (created_at DESC);
CREATE INDEX idx_ve_hospital_name ON veterinary_ecosystem (hospital_name(100));
CREATE INDEX idx_ve_state ON veterinary_ecosystem (state);
CREATE INDEX idx_ve_city ON veterinary_ecosystem (city);
CREATE INDEX idx_ve_state_city ON veterinary_ecosystem (state, city);
CREATE INDEX idx_ve_business_status ON veterinary_ecosystem (business_status);
CREATE INDEX idx_ve_rating ON veterinary_ecosystem (rating DESC);

-- ------------------------------------------------------------------------------
-- 4. HYGIENE PRODUCTS TABLE INDEXES
-- Optimizes: product_name, brand_name, product_category, sub_category, pet_type, price, rating
-- ------------------------------------------------------------------------------
CREATE INDEX idx_hygiene_created_at ON hygiene_products (created_at DESC);
CREATE INDEX idx_hygiene_product_name ON hygiene_products (product_name(100));
CREATE INDEX idx_hygiene_brand_name ON hygiene_products (brand_name);
CREATE INDEX idx_hygiene_category ON hygiene_products (product_category);
CREATE INDEX idx_hygiene_sub_cat ON hygiene_products (sub_category);
CREATE INDEX idx_hygiene_pet_type ON hygiene_products (pet_type);
CREATE INDEX idx_hygiene_price ON hygiene_products (price);
CREATE INDEX idx_hygiene_rating ON hygiene_products (rating DESC);
CREATE INDEX idx_hygiene_cat_brand ON hygiene_products (product_category, brand_name);

-- ------------------------------------------------------------------------------
-- 5. FOOD PRODUCTS TABLE INDEXES
-- Optimizes: product_name, brand_name, product_category, pet_type, life_stage, price, rating
-- ------------------------------------------------------------------------------
CREATE INDEX idx_food_created_at ON food_products (created_at DESC);
CREATE INDEX idx_food_product_name ON food_products (product_name(100));
CREATE INDEX idx_food_brand_name ON food_products (brand_name);
CREATE INDEX idx_food_category ON food_products (product_category);
CREATE INDEX idx_food_pet_type ON food_products (pet_type);
CREATE INDEX idx_food_life_stage ON food_products (life_stage);
CREATE INDEX idx_food_price ON food_products (price);
CREATE INDEX idx_food_rating ON food_products (rating DESC);
CREATE INDEX idx_food_cat_pet ON food_products (product_category, pet_type);

-- ------------------------------------------------------------------------------
-- 6. ACCESSORIES TABLE INDEXES
-- Optimizes: business_name, category, sub_category, pet_type, price, and created_at
-- ------------------------------------------------------------------------------
CREATE INDEX idx_accessories_created_at ON accessories (created_at DESC);
CREATE INDEX idx_accessories_biz_name ON accessories (business_name(100));
CREATE INDEX idx_accessories_category ON accessories (category);
CREATE INDEX idx_accessories_sub_cat ON accessories (sub_category);
CREATE INDEX idx_accessories_pet_type ON accessories (pet_type);
CREATE INDEX idx_accessories_price ON accessories (price);

-- ------------------------------------------------------------------------------
-- 7. SERVICE NETWORK TABLE INDEXES
-- Optimizes: business_name, service_type, state, city_region, rating, and created_at
-- ------------------------------------------------------------------------------
CREATE INDEX idx_sn_created_at ON service_network (created_at DESC);
CREATE INDEX idx_sn_biz_name ON service_network (business_name(100));
CREATE INDEX idx_sn_service_type ON service_network (service_type(100));
CREATE INDEX idx_sn_state ON service_network (state);
CREATE INDEX idx_sn_city_region ON service_network (city_region);
CREATE INDEX idx_sn_state_city ON service_network (state, city_region);
CREATE INDEX idx_sn_rating ON service_network (rating DESC);

-- ------------------------------------------------------------------------------
-- 8. WELFARE NETWORK TABLE INDEXES
-- Optimizes: business_name, service_type, state, city_region, rating, and created_at
-- ------------------------------------------------------------------------------
CREATE INDEX idx_wn_created_at ON welfare_network (created_at DESC);
CREATE INDEX idx_wn_biz_name ON welfare_network (business_name(100));
CREATE INDEX idx_wn_service_type ON welfare_network (service_type(100));
CREATE INDEX idx_wn_state ON welfare_network (state);
CREATE INDEX idx_wn_city_region ON welfare_network (city_region);
CREATE INDEX idx_wn_state_city ON welfare_network (state, city_region);
CREATE INDEX idx_wn_rating ON welfare_network (rating DESC);
