// Deliberately close to what browsers accept for type="email" (RFC 5322 is
// far stricter than anyone actually wants to enforce) - the previous regex
// rejected plus-addressing (user+tag@x.com) and TLDs over 3 characters
// (.info, .email), both common in real addresses, while the browser's own
// client-side check accepted them - a real address a visitor typed could
// pass client-side and still get rejected here with no clear reason why.
export const validateEmail = function (email: string): boolean {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
