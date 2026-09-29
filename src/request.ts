import {useSelectionStore} from './stores/selectionStore';


function getFirstDayOfWeek(date?: Date):string {
  const selectedDate = date || new Date();
  const day = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(); // 周日为7
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() - day + 1);

  return `${monday.getFullYear()}.${monday.getMonth() + 1}.${monday.getDate()}`;
}
function getDayOfWeek(date?: Date): number {
  const today = date || new Date();
  let dayOfWeek = today.getDay();
  dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  return dayOfWeek;
}

type floorClassroom = {
  name: string;
  rooms: string[];
}
type buildingClassroom = {
  code: string;
  count: number;
  floors: floorClassroom[];
}

function getFloorName(room: string): string {
  if (/^\d{3,}$/.test(room)) return `${Number(room.slice(0, -2))}楼`;
  return `${room.charAt(0)}楼`;
}

const baseURL = (import.meta.env.VITE_OSS_URL ?? '') as string;

/** 合并后的 JSON：/{campus}/{周一键}.json，避免按楼栋拆分导致请求数过多 */
function classroomBundleUrl(campus: string, mondayKey: string): string {
  const path = `${encodeURIComponent(campus)}/${mondayKey}.json`;
  if (baseURL === '/' || baseURL === '') return `/${path}`;
  const trimmed = baseURL.replace(/\/$/, '');
  return `${trimmed}/${path}`;
}

export async function loadClassroomData(): Promise<void> {
  const store = useSelectionStore();
  store.setLoading(true);
  const campus = store.campus;
  const targetDate = new Date(store.selectedDate);
  const date = getFirstDayOfWeek(targetDate);
  const ans = new Map<string, buildingClassroom>();
  let count = 0;
  const dow = getDayOfWeek(targetDate);
  const t0 = Number(store.time);
  const t1 = Number(store.section);

  const url = classroomBundleUrl(campus, date);
  let bundle: Record<string, Record<number, Record<number, string[]>>> = {};
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('网络请求失败，url: ' + url);
    bundle = await response.json();
  } catch (error) {
    console.error(`获取校区 ${campus} 课表数据失败:`, error);
  }

  for (const [building, data] of Object.entries(bundle)) {
    if (!data || !data[dow]) {
      ans.set(building, {
        code: building,
        count: 0,
        floors: []
      });
      continue;
    }
    const daySlots = data[dow];
    let st = new Set<string>(daySlots[t0] || []);
    for (let i = t0 + 1; i <= t1; i++) {
      const currentSet = new Set<string>(daySlots[i] || []);
      st = new Set([...st].filter((x) => currentSet.has(x)));
    }
    const tempAns = {
      code: building,
      count: st.size,
      floors: [] as floorClassroom[]
    } as buildingClassroom;
    const floors = new Map<string, string[]>();
    for (const room of Array.from(st).sort()) {
      const floorName = getFloorName(room);
      if (!floors.has(floorName)) {
        floors.set(floorName, []);
      }
      floors.get(floorName)!.push(room);
    }
    for (const [name, rooms] of floors) {
      tempAns.floors.push({ name, rooms });
    }
    tempAns.floors.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
    tempAns.floors.forEach((x) => x.rooms.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true })));
    ans.set(building, tempAns);
    count += st.size;
  }

  store.setClassroomData(Object.fromEntries(ans));
  store.setTotalClassrooms(count);
  store.setLoading(false);
}
