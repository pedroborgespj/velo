export function generateOrderCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
    const randomNumber = () => numbers[Math.floor(Math.random() * numbers.length)];
    const randomNumbers = (length) =>
        Array.from({ length }, randomNumber).join('');

    return `VLO-${randomNumber()}${randomLetter()}${randomNumbers(4)}`;
}