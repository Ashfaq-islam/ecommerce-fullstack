/**
 * Seed accounts for the mock auth backend.
 *
 * `password` is stored in plain text because nothing here is a real credential
 * store. A real API only ever sees a password on the way in, hashes it, and
 * never returns it. `publicUser` below is the shape the client is allowed to
 * see, and it deliberately omits the password.
 */
export const MOCK_USERS = [
  {
    id: 'usr_1001',
    name: 'Ashfaq Sarkar',
    email: 'demo@shopstore.test',
    phone: '01712345678',
    password: 'Passw0rd!',
    createdAt: '2025-11-04T09:12:00.000Z',
  },
  {
    id: 'usr_1002',
    name: 'Nusrat Jahan',
    email: 'nusrat@example.com',
    phone: '01812345678',
    password: 'Passw0rd!',
    createdAt: '2026-02-18T14:40:00.000Z',
  },
]

export const DEMO_CREDENTIALS = {
  email: MOCK_USERS[0].email,
  password: MOCK_USERS[0].password,
}

/** Strips the password so nothing internal can leak into a response. */
export function toPublicUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    createdAt: user.createdAt ?? null,
  }
}
