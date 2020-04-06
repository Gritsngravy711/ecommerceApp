const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepo {
    constructor(filename) {
        if(!filename) {
            throw new Error('Creating A repository requires a filename.')
        }

        this.filename = filename;
        
      try {
        fs.accessSync(this.filename)
      }catch (err) {
        fs.writeFileSync(this.filename, '[]');
      }
    }

    async getAll() {
        //1. Open the file called this.filename
       
        //2. Read its contents
     
        //3. Parse the contents
       
        //4. return the parsed data

        return  JSON.parse(
            await fs.promises.readFile(this.filename,
                {encoding:'utf8'
            })
        );
    }

    async create(attrs) {
        //attrs = {email: '', password: ''}

        const salt = crypto.randomBytes(32).toString('hex');
      const buff = await scrypt(attrs.password, salt, 64);

       attrs.id = this.randomID(); 
     const records = await this.getAll();

     const record = {...attrs,
        password: `${buff.toString('hex')}&$%#&${salt}`
     };

     records.push(record);

        await this.writeAll(records);

        return record;
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2))
    }

    randomID() {
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id) {
       const allUsers = await this.getAll();

     return allUsers.find(user => user.id === id);
    }

    async deleteUser(id) {
        const allUsers = await this.getAll();

       const user = allUsers.find(user => user.id === id );
        const index = allUsers.indexOf(user);
       allUsers.splice(index, 1);

       await this.writeAll(allUsers);
    }

    async update(id, attrs) {
        const allUsers = await this.getAll();

        const user = allUsers.find(record => record.id === id)

        if(!user) {
            throw new Error(`user with id ${id} was not found`)
        }

        Object.assign(user, attrs)

      await this.writeAll(allUsers)
    }

    async filterUsers(filters) {

        const allUsers = await this.getAll();
        const  filteredUsers = [];

        for(let user of allUsers) {
         
            for(let key in filters) {

                allUsers.filter(user => {
                    if(user[key] === filters[key]) {
                       filteredUsers.push(user);
                    }
                })
            }

            // if(found) {
            //     console.log(user)
            //     return user;
            // }

            return filteredUsers;

        }

    }

   async getByOne(filters) {
       const allUsers = await this.getAll();

       for(let user of allUsers) {
           let found = true;

           for(let key in filters) {
               if(user[key] !== filters[key]) {
                   found = false;
               }
           }

           if(found) {
               return user;
           }
       }
   }

   async comparePasswords(savedPWD,inputPWD) {

        const [hashed , salt ] = savedPWD.split('&$%#&');

        const buffer = await scrypt(inputPWD, salt, 64);

        return hashed === buffer.toString('hex');
   } 
}

module.exports = new UsersRepo('repositories/users.json');




