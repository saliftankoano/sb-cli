function formatName1(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

function validateEmail1(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

console.log(formatName1("John", "Doe"));
console.log(validateEmail1("test@example.com"));
