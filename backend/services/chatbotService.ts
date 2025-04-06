
type ReplacementMapping = Record<string, string>;

export const replacePseudoWithReal = (responseText: string, data: any): string => {
  const mapping: { [key: string]: string } = {};

  // Organization mapping
  const orgPseudo = data.organization.pseudo_data.pseudo_name;
  const orgReal = data.organization.real_data.name;
  mapping[orgPseudo] = orgReal;

  // Admin mapping
  if (data.admin?.pseudo_data && data.admin?.real_data) {
    const adminPseudo = data.admin.pseudo_data.pseudo_name;
    const adminReal = data.admin.real_data.name;
    const adminEmailPseudo = data.admin.pseudo_data.pseudo_email;
    const adminEmailReal = data.admin.real_data.email;
    mapping[adminPseudo] = adminReal;
    mapping[adminEmailPseudo] = adminEmailReal;
  }

  // Members mapping
  data.members.forEach((member: any) => {
    mapping[member.pseudo_data.pseudo_name] = member.real_data.name;
    mapping[member.pseudo_data.pseudo_email] = member.real_data.email;
  });

  // Tasks attachments mapping
  data.tasks.forEach((task: any) => {
    task.pseudo_data.attachments.forEach((att: any) => {
      mapping[att.pseudo_id] = att.real_value;
    });
  });

  // Invitation mapping
  data.organization.invitations.forEach((inv: any) => {
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
}
  

export const replaceRealWithPseudo = (userMessage: string, data: any): string => {
    const mapping: { [key: string]: string } = {};
  
    mapping[data.organization.real_data.name] = data.organization.pseudo_data.pseudo_name;
  
    data.members.forEach((member: any) => {
      mapping[member.real_data.name] = member.pseudo_data.pseudo_name;
      mapping[member.real_data.email] = member.pseudo_data.pseudo_email;
    });
  
    data.tasks.forEach((task: any) => {
      task.real_data.attachments.forEach((realUrl: string, index: number) => {
        const pseudoId = task.pseudo_data.attachments[index]?.pseudo_id;
        if (pseudoId) {
          mapping[realUrl] = pseudoId;
        }
      });
    });
  

    data.organization.invitations.forEach((inv: any) => {
      mapping[inv.token] = inv.pseudo_token;
    });
  
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    let finalText = userMessage;
    sortedKeys.forEach(key => {
      const re = new RegExp(key, 'gi'); // Case-insensitive
      finalText = finalText.replace(re, mapping[key]);
    });
  
    return finalText;
}