-- Sample Order Management System Database Schema
-- PostgreSQL (Supabase) compatible

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Orders Table
CREATE TABLE IF NOT EXISTS sample_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'in_review', 'sampling_in_progress', 'ready', 'dispatched')) DEFAULT 'draft',
    created_by VARCHAR(50) CHECK (created_by IN ('client', 'admin', 'automation')) NOT NULL,
    updated_by VARCHAR(50) CHECK (updated_by IN ('client', 'admin', 'system')),
    order_source VARCHAR(50) CHECK (order_source IN ('quick', 'structured', 'email')) DEFAULT 'structured',
    delivery_date DATE,
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    sample_type VARCHAR(50),
    notes TEXT,
    batch_id VARCHAR(50) UNIQUE,
    is_order_created BOOLEAN DEFAULT false,
    assigned_to INT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Styles Table
CREATE TABLE IF NOT EXISTS order_styles (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    item_number VARCHAR(50) NOT NULL,
    style_number VARCHAR(50),
    style_name VARCHAR(100) NOT NULL,
    print_type VARCHAR(50) CHECK (print_type IN ('solid_dyed', 'printed')) NOT NULL,
    color_name VARCHAR(100),
    pantone_number VARCHAR(20),
    design_name VARCHAR(100),
    fabric VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (order_id) REFERENCES sample_orders(id) ON DELETE CASCADE
);

-- Design Files Table (Style-level)
CREATE TABLE IF NOT EXISTS design_files (
    id SERIAL PRIMARY KEY,
    style_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    storage_provider VARCHAR(50) CHECK (storage_provider IN ('supabase', 's3', 'cloudinary')) DEFAULT 'supabase',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (style_id) REFERENCES order_styles(id) ON DELETE CASCADE
);

-- Logos Table
CREATE TABLE IF NOT EXISTS logos (
    id SERIAL PRIMARY KEY,
    style_id INT NOT NULL,
    logo_name VARCHAR(100),
    logo_type VARCHAR(50) CHECK (logo_type IN ('printed', 'embroidered')) NOT NULL,
    position VARCHAR(50),
    file_url VARCHAR(500) NOT NULL,
    storage_provider VARCHAR(50) CHECK (storage_provider IN ('supabase', 's3', 'cloudinary')) DEFAULT 'supabase',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (style_id) REFERENCES order_styles(id) ON DELETE CASCADE
);

-- Order Files Table (Order-level)
CREATE TABLE IF NOT EXISTS order_files (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    storage_provider VARCHAR(50) CHECK (storage_provider IN ('supabase', 's3', 'cloudinary')) DEFAULT 'supabase',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (order_id) REFERENCES sample_orders(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_sample_orders_client_id ON sample_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_sample_orders_status ON sample_orders(status);
CREATE INDEX IF NOT EXISTS idx_sample_orders_batch_id ON sample_orders(batch_id);
CREATE INDEX IF NOT EXISTS idx_sample_orders_order_id ON sample_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_order_styles_order_id ON order_styles(order_id);
CREATE INDEX IF NOT EXISTS idx_design_files_style_id ON design_files(style_id);
CREATE INDEX IF NOT EXISTS idx_logos_style_id ON logos(style_id);
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sample_orders_updated_at BEFORE UPDATE ON sample_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_styles_updated_at BEFORE UPDATE ON order_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logos_updated_at BEFORE UPDATE ON logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO clients (name, email, company_name) VALUES
('John Doe', 'john@example.com', 'Fashion Inc'),
('Jane Smith', 'jane@example.com', 'Apparel Co'),
('Mike Johnson', 'mike@example.com', 'Textile Ltd')
ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;