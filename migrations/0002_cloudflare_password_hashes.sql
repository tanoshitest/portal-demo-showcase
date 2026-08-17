UPDATE users
SET password_hash = 'pbkdf2$100000$hmYPoyC0Ip1NSKDpHb8o/g==$R/K2ZUXIHbr1UJ7oFl+FcSt/9YLWIfSpnY8YVl5QPYU=',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'user-admin-default';

UPDATE users
SET password_hash = 'pbkdf2$100000$pcUOhCli7YgJoN5Ajq2Bhg==$c63c9csIQsHu/AWcFwrPEuslICvdBDAygfWZeIp0Jas=',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'user-sale-default';
