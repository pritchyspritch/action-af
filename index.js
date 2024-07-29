const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {

    try {
        let workspace = process.env.GITHUB_WORKSPACE;
        let docker_name = core.getInput('docker_name', { required: true });
        let dockerEnvVars = ["ZAP_AUTH_HEADER", "ZAP_AUTH_HEADER_VALUE", "ZAP_AUTH_HEADER_SITE"].concat(core.getMultilineInput('docker_env_vars', { required: false })).map(e => `-e ${e}`).join(' ');
        let plan = core.getInput('plan', { required: true });
        let cmdOptions = core.getInput('cmd_options');

        await exec.exec(`chmod a+w ${workspace}`);

        await exec.exec(`mkdir ${workspace}/home`);

        await exec.exec(`chmod a+w ${workspace}/home`);

        await exec.exec(`docker pull ${docker_name} -q`);
        let command = (`docker run -v ${workspace}:/zap/wrk/:rw -v ${workspace}/home:/home/zap:rw --network="host" ${dockerEnvVars} -t ${docker_name} zap.sh -cmd -autorun /zap/wrk/${plan} ${cmdOptions}`);

        try {
            await exec.exec(command);
        } catch (err) {
            core.setFailed('ZAP exited with error: '  + err.toString());
            await exec.exec(`ls -la ${workspace}/home`);
            await exec.exec(`ls -la ${workspace}`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
