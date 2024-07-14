use warehouse;
SELECT * FROM products;
SELECT * FROM quadrants;
SELECT * FROM logs;
SELECT * FROM users;

ALTER TABLE products AUTO_INCREMENT = 1;
DELETE FROM products;



SELECT 
    MONTH(created_at) AS month,
    SUM(CASE WHEN operation = 'Add' THEN quantity ELSE 0 END) AS total_adds,
    SUM(CASE WHEN operation = 'Subtract' THEN quantity ELSE 0 END) AS total_subtracts
FROM 
    logs
WHERE
    YEAR(created_at) = 2024  -- Filter for the year 2024
GROUP BY 
    MONTH(created_at)
ORDER BY 
    month;


WITH months AS (
    SELECT 1 AS month UNION
    SELECT 2 UNION
    SELECT 3 UNION
    SELECT 4 UNION
    SELECT 5 UNION
    SELECT 6 UNION
    SELECT 7 UNION
    SELECT 8 UNION
    SELECT 9 UNION
    SELECT 10 UNION
    SELECT 11 UNION
    SELECT 12
)
SELECT 
    m.month,
    COALESCE(SUM(CASE WHEN l.operation = 'Add' THEN l.quantity ELSE 0 END), 0) AS total_adds,
    COALESCE(SUM(CASE WHEN l.operation = 'Subtract' THEN l.quantity ELSE 0 END), 0) AS total_subtracts
FROM 
    months m
LEFT JOIN 
    logs l ON m.month = MONTH(l.created_at) AND YEAR(l.created_at) = 2024
GROUP BY 
    m.month
ORDER BY 
    m.month;



-- Insert random log entries for January 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Add', 23, '2024-01-05', '2024-01-05'),
(2, 'Subtract', 14, '2024-01-11', '2024-01-11'),
(3, 'Add', 57, '2024-01-20', '2024-01-20'),
(4, 'Subtract', 89, '2024-01-25', '2024-01-25'),
(5, 'Add', 44, '2024-01-30', '2024-01-30');

-- Insert random log entries for February 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Subtract', 19, '2024-02-03', '2024-02-03'),
(2, 'Add', 36, '2024-02-07', '2024-02-07'),
(3, 'Subtract', 28, '2024-02-14', '2024-02-14'),
(4, 'Add', 64, '2024-02-20', '2024-02-20'),
(5, 'Subtract', 77, '2024-02-28', '2024-02-28');

-- Insert random log entries for March 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Add', 51, '2024-03-02', '2024-03-02'),
(2, 'Subtract', 25, '2024-03-08', '2024-03-08'),
(3, 'Add', 48, '2024-03-15', '2024-03-15'),
(4, 'Subtract', 93, '2024-03-23', '2024-03-23'),
(5, 'Add', 72, '2024-03-31', '2024-03-31');

-- Insert random log entries for April 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Subtract', 66, '2024-04-01', '2024-04-01'),
(2, 'Add', 81, '2024-04-10', '2024-04-10'),
(3, 'Subtract', 34, '2024-04-18', '2024-04-18'),
(4, 'Add', 59, '2024-04-24', '2024-04-24'),
(5, 'Subtract', 47, '2024-04-29', '2024-04-29');

-- Insert random log entries for May 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Add', 63, '2024-05-05', '2024-05-05'),
(2, 'Subtract', 22, '2024-05-12', '2024-05-12'),
(3, 'Add', 95, '2024-05-19', '2024-05-19'),
(4, 'Subtract', 38, '2024-05-26', '2024-05-26'),
(5, 'Add', 77, '2024-05-31', '2024-05-31');

-- Insert random log entries for June 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Subtract', 51, '2024-06-03', '2024-06-03'),
(2, 'Add', 68, '2024-06-10', '2024-06-10'),
(3, 'Subtract', 23, '2024-06-15', '2024-06-15'),
(4, 'Add', 41, '2024-06-20', '2024-06-20'),
(5, 'Subtract', 39, '2024-06-27', '2024-06-27');

-- Insert random log entries for July 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Add', 84, '2024-07-01', '2024-07-01'),
(2, 'Subtract', 46, '2024-07-08', '2024-07-08'),
(3, 'Add', 72, '2024-07-15', '2024-07-15'),
(4, 'Subtract', 31, '2024-07-21', '2024-07-21'),
(5, 'Add', 59, '2024-07-30', '2024-07-30');

-- Insert random log entries for August 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Subtract', 71, '2024-08-02', '2024-08-02'),
(2, 'Add', 54, '2024-08-10', '2024-08-10'),
(3, 'Subtract', 43, '2024-08-17', '2024-08-17'),
(4, 'Add', 96, '2024-08-23', '2024-08-23'),
(5, 'Subtract', 67, '2024-08-31', '2024-08-31');

-- Insert random log entries for September 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Add', 45, '2024-09-04', '2024-09-04'),
(2, 'Subtract', 32, '2024-09-12', '2024-09-12'),
(3, 'Add', 71, '2024-09-19', '2024-09-19'),
(4, 'Subtract', 56, '2024-09-25', '2024-09-25'),
(5, 'Add', 88, '2024-09-30', '2024-09-30');

-- Insert random log entries for October 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Subtract', 52, '2024-10-03', '2024-10-03'),
(2, 'Add', 38, '2024-10-11', '2024-10-11'),
(3, 'Subtract', 63, '2024-10-18', '2024-10-18'),
(4, 'Add', 90, '2024-10-23', '2024-10-23'),
(5, 'Subtract', 44, '2024-10-30', '2024-10-30');

-- Insert random log entries for November 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Add', 76, '2024-11-02', '2024-11-02'),
(2, 'Subtract', 35, '2024-11-09', '2024-11-09'),
(3, 'Add', 62, '2024-11-17', '2024-11-17'),
(4, 'Subtract', 83, '2024-11-24', '2024-11-24'),
(5, 'Add', 51, '2024-11-29', '2024-11-29');

-- Insert random log entries for December 2024
INSERT INTO logs (product_id, operation, quantity, created_at, updated_at) VALUES 
(1, 'Subtract', 49, '2024-12-01', '2024-12-01'),
(2, 'Add', 28, '2024-12-10', '2024-12-10'),
(3, 'Subtract', 66, '2024-12-15', '2024-12-15'),
(4, 'Add', 78, '2024-12-22', '2024-12-22'),
(5, 'Subtract', 37, '2024-12-29', '2024-12-29');

ALTER TABLE products
ADD COLUMN length DECIMAL(10, 2),
ADD COLUMN width DECIMAL(10, 2),
ADD COLUMN height DECIMAL(10, 2);

ALTER TABLE quadrants
ADD COLUMN length DECIMAL(10, 2),
ADD COLUMN width DECIMAL(10, 2),
ADD COLUMN height DECIMAL(10, 2);

UPDATE quadrants SET free_space = 125 WHERE id = 54;

UPDATE logs SET user_id = 1 WHERE user_id = 0;

SELECT 
	l.id,
    COALESCE(p.id, 0) AS product_id,
    l.product_name AS product_name,
    l.username,
    l.operation,
    l.quantity,
    l.created_at,
    l.updated_at
FROM 
    logs l
LEFT JOIN 
    products p ON l.product_id = p.id
LEFT JOIN 
    users u ON l.user_id = u.id
WHERE '' = '' OR p.name LIKE '%box%'
ORDER BY 
    p.id DESC;

UPDATE logs SET product_name = "TEST PRODUCTS(1)", quantity = 10, operation = "Add", updated_at = NOW() WHERE id = 87;

    SELECT * FROM logs;
    SELECT * FROM products where id = 76;