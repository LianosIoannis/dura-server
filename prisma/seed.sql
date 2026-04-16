BEGIN TRANSACTION;


-- Users
INSERT INTO
    "User" (
        "name",
        "email",
        "passwordHash",
        "isActive",
        "createdAt",
        "updatedAt"
    )
VALUES
    (
        'Alice Admin',
        'alice@example.com',
        '$2b$10$alicehash',
        1,
        '2026-04-01T09:00:00Z',
        '2026-04-01T09:00:00Z'
    ),
    (
        'Bob Technician',
        'bob@example.com',
        '$2b$10$bobhash',
        1,
        '2026-04-02T10:15:00Z',
        '2026-04-02T10:15:00Z'
    ),
    (
        'Charlie Support',
        'charlie@example.com',
        '$2b$10$charliehash',
        0,
        '2026-04-03T11:30:00Z',
        '2026-04-03T11:30:00Z'
    );


-- Customers
INSERT INTO
    "Customer" (
        "name",
        "phone",
        "email",
        "address",
        "notes",
        "createdAt",
        "updatedAt"
    )
VALUES
    (
        'John Doe',
        '+306912345678',
        'john.doe@example.com',
        '12 Athens Street, Athens',
        'Prefers phone contact',
        '2026-04-01T08:00:00Z',
        '2026-04-01T08:00:00Z'
    ),
    (
        'Maria Papadopoulou',
        '+306987654321',
        'maria.p@example.com',
        '45 Thessaloniki Ave, Thessaloniki',
        'VIP customer',
        '2026-04-02T08:30:00Z',
        '2026-04-02T08:30:00Z'
    ),
    (
        'Nikos Georgiou',
        NULL,
        'nikos.g@example.com',
        '78 Patras Road, Patras',
        NULL,
        '2026-04-03T09:00:00Z',
        '2026-04-03T09:00:00Z'
    ),
    (
        'Eleni Kosta',
        '+306955512345',
        NULL,
        '3 Heraklion Square, Crete',
        'Walk-in customer',
        '2026-04-04T09:30:00Z',
        '2026-04-04T09:30:00Z'
    ),
    (
        'George Smith',
        '+306944400011',
        'george.smith@example.com',
        NULL,
        'Business client',
        '2026-04-05T10:00:00Z',
        '2026-04-05T10:00:00Z'
    );


-- Orders
INSERT INTO
    "Order" (
        "status",
        "problem",
        "technicianNotes",
        "intakeNotes",
        "deviceType",
        "deviceBrand",
        "deviceModel",
        "serialNumber",
        "estimate",
        "finalTotal",
        "invoiceStatus",
        "invoiceDueAt",
        "invoicePaidAt",
        "paymentMethod",
        "createdAt",
        "updatedAt",
        "customerId"
    )
VALUES
    (
        'PENDING',
        'Laptop does not power on',
        NULL,
        'Customer said it stopped working after a power outage',
        'Laptop',
        'Dell',
        'Inspiron 15',
        'DL-001-XYZ',
        50.00,
        NULL,
        'UNPAID',
        '2026-04-20T00:00:00Z',
        NULL,
        NULL,
        '2026-04-06T09:00:00Z',
        '2026-04-06T09:00:00Z',
        1
    ),
    (
        'DIAGNOSIS',
        'Phone screen is cracked and touch is unstable',
        'Needs screen replacement',
        'Dropped from waist height',
        'Phone',
        'Samsung',
        'Galaxy S21',
        'SMG-S21-123',
        120.00,
        NULL,
        'PARTIALLY_PAID',
        '2026-04-18T00:00:00Z',
        NULL,
        'CARD',
        '2026-04-06T10:00:00Z',
        '2026-04-07T12:00:00Z',
        2
    ),
    (
        'WAITING_APPROVAL',
        'Tablet battery drains very quickly',
        'Battery health under 60%',
        'Customer requested cost estimate first',
        'Tablet',
        'Apple',
        'iPad Air',
        'APL-IPAD-456',
        95.00,
        NULL,
        'UNPAID',
        '2026-04-22T00:00:00Z',
        NULL,
        NULL,
        '2026-04-07T08:45:00Z',
        '2026-04-07T15:30:00Z',
        3
    ),
    (
        'IN_REPAIR',
        'Desktop overheating and shutting down',
        'Cleaning fan and replacing thermal paste',
        'Very dusty inside case',
        'Desktop',
        'HP',
        'Pavilion',
        'HP-PAV-789',
        70.00,
        NULL,
        'UNPAID',
        '2026-04-25T00:00:00Z',
        NULL,
        NULL,
        '2026-04-07T09:15:00Z',
        '2026-04-08T14:20:00Z',
        4
    ),
    (
        'READY',
        'Keyboard keys not responding',
        'Replaced damaged keyboard membrane',
        'Liquid spill suspected',
        'Laptop',
        'Lenovo',
        'ThinkPad T14',
        'LNV-T14-321',
        80.00,
        85.00,
        'UNPAID',
        '2026-04-15T00:00:00Z',
        NULL,
        NULL,
        '2026-04-08T10:10:00Z',
        '2026-04-10T16:00:00Z',
        5
    ),
    (
        'COMPLETED',
        'SSD upgrade and OS reinstall',
        'Installed 1TB SSD and configured system',
        'Requested faster boot times',
        'Laptop',
        'Acer',
        'Aspire 5',
        'ACR-A5-654',
        150.00,
        150.00,
        'PAID',
        '2026-04-12T00:00:00Z',
        '2026-04-11T13:00:00Z',
        'BANK_TRANSFER',
        '2026-04-08T11:00:00Z',
        '2026-04-11T13:00:00Z',
        1
    ),
    (
        'CANCELLED',
        'Smartwatch not charging',
        'Charging coil likely damaged',
        'Customer declined repair after estimate',
        'Smartwatch',
        'Xiaomi',
        'Mi Watch',
        'XM-WCH-987',
        60.00,
        NULL,
        'VOID',
        NULL,
        NULL,
        NULL,
        '2026-04-09T09:40:00Z',
        '2026-04-10T09:00:00Z',
        2
    ),
    (
        'COMPLETED',
        'Data recovery from failing hard drive',
        'Recovered 90% of files',
        'Drive making clicking noise',
        'External HDD',
        'Western Digital',
        'My Passport',
        'WD-HDD-222',
        200.00,
        220.00,
        'PAID',
        '2026-04-14T00:00:00Z',
        '2026-04-13T10:30:00Z',
        'CASH',
        '2026-04-09T12:20:00Z',
        '2026-04-13T10:30:00Z',
        3
    );


COMMIT;