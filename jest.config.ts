module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src', // Thư mục chứa mã nguồn
  testRegex: '.*\\.spec\\.ts$', // Chỉ định file test (đuôi .spec.ts)
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['*/.(t|j)s'], // Phạm vi thu thập coverage
  coverageDirectory: '../coverage', // Thư mục chứa báo cáo coverage
  testEnvironment: 'node', // Môi trường test (Node.js)
   moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};

 // "jest": {
  //   "moduleFileExtensions": [
  //     "js",
  //     "json",
  //     "ts"
  //   ],
  //   "rootDir": "src",
  //   "testRegex": ".*\\.spec\\.ts$",
  //   "transform": {
  //     "^.+\\.(t|j)s$": "ts-jest"
  //   },
  //   "collectCoverageFrom": [
  //     "**/*.(t|j)s"
  //   ],
  //   "coverageDirectory": "../coverage",
  //   "testEnvironment": "node", 
  // }