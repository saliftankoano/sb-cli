function formatName1(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

function validateEmail1(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function formatName2(firstName: string, lastName: string): string {
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }
  return `${firstName} ${lastName}`;
}

function validateEmail2(email: string): boolean {
  if (!email) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
console.log(formatName1("John", "Doe"));
console.log(validateEmail1("test@example.com"));
console.log(formatName2("John", "Doe"));
