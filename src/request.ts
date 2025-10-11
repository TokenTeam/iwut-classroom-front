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
const baseURL = import.meta.env.VITE_OSS_URL;
export async function loadClassroomData(): Promise<void> {
  const store = useSelectionStore();
  store.setLoading(true);
  const campus = store.campus;
  const targetDate = new Date(store.selectedDate);
  const date = getFirstDayOfWeek(targetDate);
  const ans = new Map<string, buildingClassroom>();
  let count = 0;
  for (const building of campusBuildingMap[campus] || []) {
    const url = baseURL + `/${campus}/${building}/${date}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error('网络请求失败，url: ' + url);
      const data = await response.json();
      let st = new Set<string>(data[getDayOfWeek(targetDate)][Number(store.time)]);
      for(let i = Number(store.time) + 1; i <= Number(store.section); i++) {
        const currentSet = new Set<string>(data[getDayOfWeek(targetDate)][i]);
        st = new Set([...st].filter(x => currentSet.has(x)));
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
        if(!floors.has(floorName)) {
          floors.set(floorName, []);
        }
        floors.get(floorName)!.push(room);
      }
      for (const [name, rooms] of floors) {
        tempAns.floors.push({name, rooms});
      }
      tempAns.floors.sort((a, b) => a.name.localeCompare(b.name));
      tempAns.floors.map(x => x.rooms.sort())
      ans.set(buildingNameMap[building] || building, tempAns);
      count += st.size;
    } catch (error) {
      console.log(`获取建筑 ${building} 的教室数据失败:`, error);
    }
  }
  console.log(Object.fromEntries(ans));
  store.setClassroomData(Object.fromEntries(ans));
  store.setTotalClassrooms(count);
  store.setLoading(false);
}