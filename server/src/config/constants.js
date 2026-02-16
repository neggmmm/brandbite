export const ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    STAFF: 'staff',
    OWNER: 'owner',
    SUPER_ADMIN: 'super_admin'
}

export const PERMISSIONS = {
    [ROLES.CUSTOMER]: [
        'view_menu',
        'place_order'],
    [ROLES.ADMIN]: [
        'view_menu',
        'place_order',
        'manage_menu',
        'manage_orders',
        'manage_users',
        'view_reports'],
    [ROLES.STAFF]: [
        'view_menu',
        'place_order',
        'manage_orders'],
    [ROLES.OWNER]: [
        'view_menu',
        'place_order',
        'manage_menu',
        'manage_orders',
        'manage_users',
        'view_reports'],
    [ROLES.SUPER_ADMIN]: [
        'view_menu',
        'place_order',
        'manage_menu',
        'manage_orders',
        'manage_users',
        'view_reports',
        'manage_restaurants']
}