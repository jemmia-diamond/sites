const JOB_IDS_KEY = "jobIds";

export function getJobIds(): number[] {
  try {
    const data = localStorage.getItem(JOB_IDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load jobIds from localStorage", e);
    return [];
  }
}

export function saveJobIds(ids: number[]) {
  try {
    localStorage.setItem(JOB_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Failed to save jobIds to localStorage", e);
  }
}

export function addJobId(id: number) {
  const ids = getJobIds();
  if (!ids.includes(id)) {
    saveJobIds([id, ...ids]);
    window.dispatchEvent(new Event("tryon:job-change"));
  }
}
