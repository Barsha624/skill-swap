// Demo mode starts completely empty — every user, session, message and review
// is created by whoever is using the app (stored only in their own browser).
export function seed() {
  return { users: [], reviews: [], bookings: [], notifications: [], messages: [] };
}
