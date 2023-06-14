export class AGE_LIST {
    list_retirement_ages: string[] = [];
  
    constructor() {
      for (let age = 20; age <= 80; age++) {
        this.list_retirement_ages.push(`${age} Years Old`);
      }
    }
  }
  