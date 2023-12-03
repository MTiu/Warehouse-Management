USE warehouse;

INSERT INTO quadrants(name, total_space, free_space, created_at, updated_at)
VALUES
("quadrant 1", 10, 10, NOW(), NOW()),
("quadrant 2", 10, 10, NOW(), NOW()),
("quadrant 3", 10, 10, NOW(), NOW()),
("quadrant 4", 10, 10, NOW(), NOW()),
("quadrant 5", 10, 10, NOW(), NOW()),
("quadrant 6", 10, 10, NOW(), NOW()),
("quadrant 7", 10, 10, NOW(), NOW()),
("quadrant 8", 10, 10, NOW(), NOW());


INSERT INTO products(quadrant_id, name, quantity, created_at, updated_at) 
VALUES
(1, "cement1", 50, NOW(), NOW()),
(1, "cement2", 50, NOW(), NOW()),
(1, "cement3", 50, NOW(), NOW()),
(1, "cement4", 50, NOW(), NOW()),
(1, "cement5", 50, NOW(), NOW()),

(2, "nails1", 50, NOW(), NOW()),
(2, "nails2", 50, NOW(), NOW()),
(2, "nails3", 50, NOW(), NOW()),
(2, "nails4", 50, NOW(), NOW()),
(2, "nails5", 50, NOW(), NOW()),

(3, "bricks1", 50, NOW(), NOW()),
(3, "bricks2", 50, NOW(), NOW()),
(3, "bricks3", 50, NOW(), NOW()),
(3, "bricks4", 50, NOW(), NOW()),
(3, "bricks5", 50, NOW(), NOW()),

(4, "plywood1", 50, NOW(), NOW()),
(4, "plywood2", 50, NOW(), NOW()),
(4, "plywood3", 50, NOW(), NOW()),
(4, "plywood4", 50, NOW(), NOW()),
(4, "plywood5", 50, NOW(), NOW()),

(5, "tiles1", 50, NOW(), NOW()),
(5, "tiles2", 50, NOW(), NOW()),
(5, "tiles3", 50, NOW(), NOW()),
(5, "tiles4", 50, NOW(), NOW()),
(5, "tiles5", 50, NOW(), NOW());