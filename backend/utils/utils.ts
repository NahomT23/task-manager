export const formatDuration = (durationDays: number): string => {
    if (durationDays === 0) return "0 days";
    const parts: string[] = [];
  
    const months = Math.floor(durationDays / 30);
    const remainingDays = durationDays % 30;
    const days = Math.floor(remainingDays);
    const hoursDecimal = (remainingDays - days) * 24;
    const hours = Math.floor(hoursDecimal);
    const minutes = Math.round((hoursDecimal - hours) * 60);
  
    // Add months
    if (months > 0) {
      parts.push(`${months} month${months > 1 ? "s" : ""}`);
    }
    // Add days
    if (days > 0) {
      parts.push(`${days} day${days > 1 ? "s" : ""}`);
    }
    // Add hours
    if (hours > 0) {
      parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    }
    // Add minutes (only for durations < 1 day)
    if (minutes > 0 && durationDays < 1) {
      parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
    // Handle edge case: duration < 1 day with hours and minutes
    if (durationDays < 1) {
      if (hours > 0 && minutes > 0) {
        parts.splice(-2, 2, `${hours} hour${hours > 1 ? "s" : ""}`, `${minutes} minute${minutes > 1 ? "s" : ""}`);
      } else if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
      } else if (minutes > 0) {
        parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
      }
    }
    // Join parts with commas and "and"
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts.join(" and ");
    return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  };
  