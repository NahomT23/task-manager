"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceRealWithPseudo = exports.replacePseudoWithReal = void 0;
const replacePseudoWithReal = (responseText, data) => {
    var _a, _b;
    const mapping = {};
    // Organization mapping
    const orgPseudo = data.organization.pseudo_data.pseudo_name;
    const orgReal = data.organization.real_data.name;
    mapping[orgPseudo] = orgReal;
    // Admin mapping
    if (((_a = data.admin) === null || _a === void 0 ? void 0 : _a.pseudo_data) && ((_b = data.admin) === null || _b === void 0 ? void 0 : _b.real_data)) {
        const adminPseudo = data.admin.pseudo_data.pseudo_name;
        const adminReal = data.admin.real_data.name;
        const adminEmailPseudo = data.admin.pseudo_data.pseudo_email;
        const adminEmailReal = data.admin.real_data.email;
        mapping[adminPseudo] = adminReal;
        mapping[adminEmailPseudo] = adminEmailReal;
    }
    // Members mapping
    data.members.forEach((member) => {
        mapping[member.pseudo_data.pseudo_name] = member.real_data.name;
        mapping[member.pseudo_data.pseudo_email] = member.real_data.email;
    });
    // Tasks attachments mapping
    data.tasks.forEach((task) => {
        task.pseudo_data.attachments.forEach((att) => {
            mapping[att.pseudo_id] = att.real_value;
        });
    });
    // Invitation mapping
    data.organization.invitations.forEach((inv) => {
        mapping[inv.pseudo_token] = inv.token;
    });
    // Replace all occurrences with case-insensitive regex
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    let finalText = responseText;
    sortedKeys.forEach(key => {
        const re = new RegExp(key, 'gi'); // Case-insensitive replacement
        finalText = finalText.replace(re, mapping[key]);
    });
    return finalText;
};
exports.replacePseudoWithReal = replacePseudoWithReal;
const replaceRealWithPseudo = (userMessage, data) => {
    const mapping = {};
    mapping[data.organization.real_data.name] = data.organization.pseudo_data.pseudo_name;
    data.members.forEach((member) => {
        mapping[member.real_data.name] = member.pseudo_data.pseudo_name;
        mapping[member.real_data.email] = member.pseudo_data.pseudo_email;
    });
    data.tasks.forEach((task) => {
        task.real_data.attachments.forEach((realUrl, index) => {
            var _a;
            const pseudoId = (_a = task.pseudo_data.attachments[index]) === null || _a === void 0 ? void 0 : _a.pseudo_id;
            if (pseudoId) {
                mapping[realUrl] = pseudoId;
            }
        });
    });
    data.organization.invitations.forEach((inv) => {
        mapping[inv.token] = inv.pseudo_token;
    });
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    let finalText = userMessage;
    sortedKeys.forEach(key => {
        const re = new RegExp(key, 'gi'); // Case-insensitive
        finalText = finalText.replace(re, mapping[key]);
    });
    return finalText;
};
exports.replaceRealWithPseudo = replaceRealWithPseudo;
