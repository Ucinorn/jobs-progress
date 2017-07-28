var getDefaultPlayer = function() {
        return {
          name: "",
          job: "",
          currentJob: {},
          zone: "",
          currentZone: {},
          area: "",
          level: 1,
          exp: 0,
          next: 5,
          perks: {},
          bought: [],
          skills: {
              labour:     {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              combat:     {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              archery:    {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              scouting:   {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              whiteMagic: {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              blackMagic: {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              herbalism:  {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              diplomacy:  {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              guile:      {level: 1, exp: 0, multi:1, next: 10, progress: 0},
              divinity:   {level: 1, exp: 0, multi:1, next: 10, progress: 0},
          },
        }
}