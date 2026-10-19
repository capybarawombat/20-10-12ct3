import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/experience.spec.ts',timeout:60000,workers:1,use:{baseURL:'http://garden.local',headless:true,launchOptions:{executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']}},reporter:'list'});
