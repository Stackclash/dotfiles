from subprocess import run, PIPE
import logging
import platform
import argparse
import json
import shutil


def run_jq(filter, data):
    data = json.dumps(data)
    proc = run(['jq', '-r', filter],
               stderr=PIPE, stdout=PIPE, input=data, encoding='UTF-8')
    if proc.returncode != 0:
        logging.error(proc.stderr)
        exit(1)
    return proc.stdout


def build_install_script(install_object):
    if (len(install_object['script']) > 0):
        script = install_object['script']
    else:
        script = f'{install_object["cmd"]} install {install_object["name"]}'
        if (len(install_object['args']) > 0):
            script += f' {install_object["args"]}'
    logging.debug(f'Using "{script}" as install script')
    return script


def select_app(name, os, config):
    result = run_jq(
        f'.[] | select((.name == "{name}") and (.install | has("{os}")))',
        config)
    result = json.loads(result)
    return result


def setup_apps(os, apps, config):
    # check for elevated permissions

    for app in apps:
        install_object = select_app(app, os, config)['install'][os]
        logging.info(f'Installing {app} with {install_object["cmd"]}')
        script = build_install_script(install_object)
        proc = run(script.split(' '), stderr=PIPE)
        if (proc.returncode != 0):
            exit(1)


def setup_dotfiles(os, apps, config):

    for app in apps:
        install_object = select_app(app, os, config)

        if ('config' in install_object):
            for dotfile in install_object['config']:
                method = dotfile["method"]
                logging.info(
                    f'Moving {dotfile["file"]} to {dotfile["destination"]} by {method}')
                # test if file exists
                # test if destination exists
                if (method == 'copy'):
                    shutil.copy(
                        f'dotfiles/{dotfile["file"]}', dotfile["destination"])
                elif (method == 'symlink'):
                    os.symlink(
                        f'dotfiles/{dotfile["file"]}', dotfile["destination"])


def filter_config(args):
    os = platform.system()
    config_file = open('config.json')
    config = json.load(config_file)

    select = f'(.install | has("{os}")) and (.enabled)'
    for tag in args.tags:
        select += f' and (.tags[] | index("{tag}"))'

    filter = f'.[] | select({select}) | .name'
    apps = run_jq(filter, config)
    apps = apps.splitlines()

    if (args.install != 'dotfiles'):
        setup_apps(os, apps, config)
    if (args.install != 'apps'):
        setup_dotfiles(os, apps, config)

def init():
    parser = argparse.ArgumentParser(
        description='Dotfile and App Setup Script',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        '-t',
        '--tags',
        help='Tag Selector',
        nargs='*',
        default=[])
    parser.add_argument(
        '-i',
        '--install',
        help='Setup dotfiles or apps. If empty both are setup',
        choices=['apps', 'dotfiles'])
    parser.add_argument(
        '-l',
        '--log-level',
        default=logging.INFO,
        type=lambda x: getattr(logging, x),
        help='Configure the logging level.'
    )
    args = parser.parse_args()
    logging.basicConfig(level=args.log_level)
    filter_config(args)


if __name__ == '__main__':
    init()
