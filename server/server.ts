import express, { Request, Response } from 'express';
import cors from 'cors';


// NOTE: you may modify these interfaces
interface Student {
  id: number;
  name: string;
}

interface GroupSummary {
  id: number;
  groupName: string;
  members: number[];
}

interface Group {
  id: number;
  groupName: string;
  members: Student[];
}

const app = express();
const port = 3902;

app.use(cors());
app.use(express.json());

/* sample database
let groups: GroupSummary[] = [
  { id: 1, groupName: 'Group 1', members: [1 ,2, 4] },
  { id: 2, groupName: 'Group 2', members: [3 ,5] },
];

let students: Student[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'David' },
  { id: 5, name: 'Eve' },
];
*/

// create empty array for initial storage
const groups: GroupSummary[] = [];
const students: Student[] = [];
let groupIdCount: number = 0;
let studentIdCount: number = 0;


/**
 * Route to get all groups
 * @route GET /api/groups
 * @returns {Array} - Array of group objects
 */
app.get('/api/groups', (req: Request, res: Response) => {
  res.json(groups);
});

/**
 * Route to get all students
 * @route GET /api/students
 * @returns {Array} - Array of student objects
 */
app.get('/api/students', (req: Request, res: Response) => {
  res.json(students);
});

/**
 * Route to add a new group
 * @route POST /api/groups
 * @param {string} req.body.groupName - The name of the group
 * @param {Array} req.body.members - Array of member names
 * @returns {Object} - The created group object
 */
app.post('/api/groups', (req: Request, res: Response) => {
  // TODO: implement storage of a new group and return their info (sample response below)
  const groupName: string = req.body.groupName;
  const memberNames: Array<string> = req.body.members;

  // check if memberNames already exists in students array 
  let memberIds: number[] = [];
  memberNames.forEach(mStr => {
    let existingStudent = students.find(s => s.name === mStr);
    if (existingStudent) {
      memberIds.push(existingStudent.id);
    } else {
      const newStu: Student = { id: studentIdCount, name: mStr };
      students.push(newStu);
      memberIds.push(studentIdCount);
      studentIdCount++;
    }
  });
  
  // check if groupName and same members already exists in groups
  // edge-case: don't add new group if groupId and same members already exist
  const exists = groups.some(g => 
    g.members.length === memberIds.length &&
    g.groupName === groupName &&
    g.members.every(m => memberIds.includes(m))
  );
  
  if (exists) {
    return res.status(404).json({ error: 'Group already exists' }); 
  }

  const newGroup: GroupSummary = {
    id: groupIdCount = groupIdCount + 1,
    groupName: groupName,
    members: memberIds,
  }
  // Only add new group if group does not exist in groups
  if (!exists) {
    groups.push(newGroup);
  }

  res.json(newGroup);
});

/**
 * Route to delete a group by ID
 * @route DELETE /api/groups/:id
 * @param {number} req.params.id - The ID of the group to delete
 * @returns {void} - Empty response with status code 204
 */
app.delete('/api/groups/:id', (req: Request, res: Response) => {
  // TODO: (delete the group with the specified id)
  const groupId = parseInt(req.params.id);

  // Find the index of the group to delete
  const groupIndex = groups.findIndex(g => g.id === groupId);

  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }

  groups.splice(groupIndex, 1);

  res.sendStatus(204); // send back a 204 (do not modify this line)
});

/**
 * Route to get a group by ID (for fetching group members)
 * @route GET /api/groups/:id
 * @param {number} req.params.id - The ID of the group to retrieve
 * @returns {Object} - The group object with member details
 */
app.get('/api/groups/:id', (req: Request, res: Response) => {
  // TODO: (sample response below)
  const groupId = parseInt(req.params.id);
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return res.status(404).send('Group not found');
  }

  // Get the member details for the found group
  const memberDetails = group.members.map(memberId => {
    const student = students.find(s => s.id === memberId);
    return student;
  });

  // return the group
  res.json({
    id: group.id,
    groupName: group.groupName,
    members: memberDetails,
  });

  /* TODO:
   * if (group id isn't valid) {
   *   res.status(404).send("Group not found");
   * }
   */
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
