export const _404controller = (req, res, next) => {
  res.status(404).render('404', { isLogined: req.isLogined, user: req.session.user, pageTitle: 'Page Not Found' });
};