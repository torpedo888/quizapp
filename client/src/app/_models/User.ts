export interface User {
    username: string;
    token: string;
    photoUrl: string;
    knownAs: string;
    gender: string;
    city: string;
    country: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    roles: string[];
}
