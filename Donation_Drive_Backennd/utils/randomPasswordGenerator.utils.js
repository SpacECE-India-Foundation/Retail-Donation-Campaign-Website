import crypto from "crypto";

export const generateRandomPassword = (length = 12) => {

    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "@#$%&*!?";

    const allCharacters =
        lowercase + uppercase + numbers + symbols;

    let password = "";

    // Ensure at least one character from each category
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += symbols[crypto.randomInt(symbols.length)];

    // Fill the remaining length
    for (let i = 4; i < length; i++) {
        password += allCharacters[
            crypto.randomInt(allCharacters.length)
        ];
    }

    // Shuffle the password
    return password
        .split("")
        .sort(() => crypto.randomInt(3) - 1)
        .join("");
};