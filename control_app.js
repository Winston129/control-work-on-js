import ps_list from 'ps-list';
import { exec } from 'child_process';
import readline from 'readline';
import fs from 'fs';
/*
pm2 start your_script.js
pm2 stop your_script.js
    || - or
    && - and
*/

/* ADD and CORRECT
    затычку, "фора".
    при выходи из всех приложений время должно астанавливаться.
    запись в .txt для запии оставшегося времяни.
*/


class KillApps{
    /*======================*/
    /*  Receives User Data  */
    /*======================*/
    constructor(time_type, timer, block_apps, type_load, {type_interval_monitoring="s", interval_monitoring=10, speed_animation=150}){
    // mandatory parameters
        //type time: second, minute, hour
        if (!["s", "m", "h"].includes(time_type)){
            throw new Error("Need select: 's', 'm', 'h'");
        }
        if(time_type==="s") this.timer = timer *1000; //conversion second
        else if(time_type==="m") this.timer = timer *60*1000; //conversion minute
        else if(time_type==="h") this.timer = timer *60*60*1000; //conversion hour
        //list app for block
        if(Array.isArray(block_apps) && block_apps.length !== 0){
            this.block_apps = block_apps;
        }
        else{
            throw new Error("Need array with apps");
        }
        //type saner load
        if(typeof type_load !== "number" || type_load < 1 || type_load > 4){
            throw new Error("Need select type load: 1, 2, 3, 4");
        }
        this.type_load = type_load-1;

    // not optional parameters
        //interval monitoring processes(in second)
        if(type_interval_monitoring==="s") this.interval_monitoring = interval_monitoring*1000;
        if(type_interval_monitoring==="m") this.interval_monitoring = interval_monitoring*60*1000;
        if(type_interval_monitoring==="h") this.interval_monitoring = interval_monitoring*60*60*1000;
        //speed for playing animation
        this.speed_animation = speed_animation;
    }

    write_time_in_file(){
        fs.writeFileSync("time.txt", this.timer.toString());
        // let file = fs.openSync("time.txt", "w+");
        // fs.writeSync(file, this.timer);
        // fs.closeSync(file);
        this.monitorApps();
    }

    /*======================*/
    /*    Kill Processes    */
    /*======================*/
    kill_apps(process){
        setInterval(()=>{
            console.log(`${process.name} : ${process.pid}`);
            exec(`taskkill /PID ${process.pid} /F`, (err)=>{
                if(err){
                    console.error("Эррор ебаный в рот");
                }
                else{
                    console.log("Выкл");
                }
            });
        }, 5*1000);
    }


    /*==============================*/
    /*    Monitor Dangerous Apps    */
    /*==============================*/
    monitorApps(){
        let find_processes = false;
        if(!find_processes){
            this.print_load(this.type_load);
        }

        setInterval(async()=>{
            let work_processes = await ps_list();
            let work_processes_filter = work_processes.filter(proc => this.block_apps.includes(proc.name));

            // if (work_processes_filter.length !== 0){
            //     console.log(work_processes_filter);
            // }
            // else{
            //     console.log("non");
            // }


            if (work_processes_filter.length !== 0){
                this.timer = fs.readFileSync("time.txt", "utf8");

                find_processes = true;
                console.log("You on process");

                await new Promise((resolve, reject)=>{
                    setInterval(()=>{
                        this.timer -=1000;
                    },1000);

                    setTimeout(()=>{
                        resolve();
                    },this.interval_monitoring)
                });

                await Promise.all(
                    work_processes_filter.forEach(async proc => {
                        try{
                            await this.kill_apps(proc);
                        }
                        catch (error){
                            console.warn(error);
                        }
                    })
                );
                work_processes_filter = "";

            }
            else{
                this.write_time_in_file();
            }


        }, this.interval_monitoring);
    }


    /*===============================*/
    /*    Paint Animation Loading    */
    /*===============================*/
    print_load(type_load){
        console.clear();
        const frames_1 = ['|', '/', '-', '\\'];
        const frames_2 = ['..', ':.', '::', '.:'];
        const frames_3 = ["...", "*..", ".*.", '..*'];
        const frames_4 = [
            "[_______________] Loading...",
            "[█______________] Loading...",
            "[██_____________] Loading...",
            "[███____________] Loading...",
            "[████___________] Loading...",
            "[█████__________] Loading...",
            "[██████_________] Loading...",
            "[███████________] Loading...",
            "[████████_______] Loading...",
            "[█████████______] Loading...",
            "[██████████_____] Loading...",
            "[███████████____] Loading...",
            "[████████████___] Loading...",
            "[█████████████__] Loading...",
            "[██████████████_] Loading...",
            "[███████████████] Loading...",
        ];
        var arr_frames = [frames_1, frames_2, frames_3, frames_4];

        /*---------select frames---------*/
        let frames = arr_frames[type_load];
        /*---------select frames---------*/

        let frameIndex = 0;
        setInterval(() => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`Analyzing processes ${frames[frameIndex]}`);
            frameIndex = (frameIndex + 1) % frames.length;
        }, this.speed_animation);
    }
}


const block_apps = [
    "REDprelauncher.exe",
    "AssassinsCreed_Dx9.exe",
    "TLauncher.exe",
    "Blasphemous 2.exe",
    "Telegram.exe",
    "GWT.exe",
    // "Code.exe",
];
let killApp_1 = new KillApps("s" , 1, block_apps, 4, {type_interval_monitoring:"s", interval_monitoring:10, speed_animation:150});
// killApp_1.monitorApps();
killApp_1.write_time_in_file();