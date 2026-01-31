export const calculateAge = (birth_day) => {
  const birthDate = new Date(birth_day);
  const now = new Date();

  if (isNaN(birthDate.getTime())) {
    throw new Error("Fecha de nacimiento inválida");
  }

  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }

  // Evita edades negativas si la fecha es futura
  return age >= 0 ? age : 0;
};
