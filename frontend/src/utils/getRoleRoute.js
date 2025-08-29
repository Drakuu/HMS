export const getRoleRoute = (path = '') => {
  const [role] = window.location.pathname.split('/').filter(Boolean);
  return `/${role}/${path}`.replace(/\/+/g, '/');
};