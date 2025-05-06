module.exports ={
    reporter:[
        'default',
        ['jest-junit',{outputDirectory:'./',outputName:'junit.xml'}]
    ],
    collectCoverage:true,
    coverageReporters:['lcov','text'],
    testEnvironment:'jsdom'
};