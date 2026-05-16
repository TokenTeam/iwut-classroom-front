import {useSelectionStore} from './stores/selectionStore';

const buildingNameMap: Record<string, string> = {
  '010102': '弘毅楼（附楼）',
  '010103': '弘毅楼（主楼）',
  '010106': '致远楼',
  '010201': '东教学楼',
  '020101': '爱特楼',
  '020102': '北教一',
  '020103': '北教二',
  '020104': '北教三',
  '020105': '学海楼',
  '020201': '博学北楼',
  '020202': '博学东楼',
  '020203': '博学西楼',
  '020204': '博学主楼',
  '030102': '教学大楼',
  '030201': '航海楼'
}

const campusBuildingMap: Record<string, string[]> = {
  '0101': ['010102', '010103', '010106'],
  '0102': ['010201'],
  '0201': ['020101', '020102', '020103', '020104', '020105'],
  '0202': ['020201', '020202', '020203', '020204'],
  '0301': ['030102', '030201']
}


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
// const baseURL = (import.meta.env.VITE_OSS_URL ?? '') as string;
const baseURL = ('/api/iwut/classroom/') as string;

/** 合并后的 JSON：/{campus}/{周一键}.json，避免按楼栋拆分导致请求数过多 */
function classroomBundleUrl(campus: string, mondayKey: string): string {
  const path = `${campus}/${mondayKey}.json`;
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

  for (const building of campusBuildingMap[campus] || []) {
    const data = bundle[building];
    if (!data || !data[dow]) {
      ans.set(buildingNameMap[building] || building, {
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
      const floorNumber = room.charAt(0);
      const floorName = `${floorNumber}楼`;
      if (!floors.has(floorName)) {
        floors.set(floorName, []);
      }
      floors.get(floorName)!.push(room);
    }
    for (const [name, rooms] of floors) {
      tempAns.floors.push({ name, rooms });
    }
    tempAns.floors.sort((a, b) => a.name.localeCompare(b.name));
    tempAns.floors.forEach((x) => x.rooms.sort());
    ans.set(buildingNameMap[building] || building, tempAns);
    count += st.size;
  }

  store.setClassroomData(Object.fromEntries(ans));
  store.setTotalClassrooms(count);
  store.setLoading(false);
}