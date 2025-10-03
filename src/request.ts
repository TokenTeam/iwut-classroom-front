import { useSelectionStore } from './stores/selectionStore';

interface RequestParams {
  campus_code: string;
  start_time: number;
  end_time: number;
  building_code?: string;
}

const API_CONFIG = {
  CLASSROOMS: "/api/get_classrooms",
  BUILDINGS: "/api/get_available_buildings"
} as const;

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

const createApiRequest = (endpoint: string) => async (params: RequestParams): Promise<any> => {
  const stringParams: Record<string, string> = {
    campus_code: params.campus_code,
    start_time: params.start_time.toString(),
    end_time: params.end_time.toString(),
  };

  if (params.building_code) {
    stringParams.building_code = params.building_code;
  }

  const queryString = new URLSearchParams(stringParams).toString();
  const url = `${endpoint}?${queryString}`;

  const headers: HeadersInit = {
    "accept": "application/json",
};

  try {
    const response = await fetch(url, {
      headers,
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('网络请求错误:', error);
    throw error;
  }
};
export const getAvailableBuildings = createApiRequest(API_CONFIG.BUILDINGS);
export const getClassrooms = createApiRequest(API_CONFIG.CLASSROOMS);

const groupClassroomsByFloor = (classrooms: string[]): { name: string; rooms: string[] }[] => {
  const floorMap: Record<string, string[]> = {};

  classrooms.forEach(room => {
    const floorNumber = room.charAt(0);
    const floorName = `${floorNumber}楼`;

    if (!floorMap[floorName]) {
      floorMap[floorName] = [];
    }
    floorMap[floorName].push(room);
  });

  return Object.entries(floorMap)
    .map(([name, rooms]) => ({ name, rooms: rooms.sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const fetchAllClassroomData = async (): Promise<Record<string, any>> => {
  const store = useSelectionStore();

  try {
    store.setLoading(true);

    const params: RequestParams = {
      campus_code: store.campus,
      start_time: Number(store.time),
      end_time: Number(store.section)
    };

    const campusBuildings = campusBuildingMap[store.campus] || [];

    const classroomRequests = campusBuildings.map(async (buildingCode: string) => {
      try {
        const data = await getClassrooms({ ...params, building_code: buildingCode });
        const buildingName = buildingNameMap[buildingCode] || buildingCode;

        const floors = groupClassroomsByFloor(data || []);
        const totalRooms = floors.reduce((total, floor) => total + floor.rooms.length, 0);

        return {
          [buildingName]: {
            code: buildingCode,
            count: totalRooms,
            floors: floors
          }
        };
      } catch (error) {
        console.error(`获取建筑 ${buildingCode} 的教室数据失败:`, error);
        const buildingName = buildingNameMap[buildingCode] || buildingCode;
        return {
          [buildingName]: {
            code: buildingCode,
            count: 0,
            floors: []
          }
        };
      }
    });

    const results = await Promise.all(classroomRequests);
    const classroomData = Object.assign({}, ...results);

    const totalClassrooms = Object.values(classroomData).reduce((total: number, building: any) => {
      return total + building.count;
    }, 0);

    store.setClassroomData(classroomData);
    store.setTotalClassrooms(totalClassrooms);

    return classroomData;

  } catch (error) {
    console.error("数据获取失败:", error);
    throw error;
  } finally {
    store.setLoading(false);
  }
};