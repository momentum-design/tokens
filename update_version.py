import argparse
import json
import subprocess
import shutil
import sys
import os

def update_version_value(package_json_path, new_version):
    if not os.path.isfile(package_json_path):
        print(f"error: {package_json_path} not exist")
        sys.exit(1)

    try:
        with open(package_json_path, "r", encoding="utf-8") as f:
            package_data = json.load(f)
    except Exception as e:
        print(f"error when read {package_json_path} error : {e}")
        sys.exit(1)

    package_data["dependencies"]["@momentum-design/tokens"] = new_version

    try:
        with open(package_json_path, "w", encoding="utf-8") as f:
            json.dump(package_data, f, indent=2)
            print(f"success update the version to {new_version} in {package_json_path}")
    except Exception as e:
        print(f"error when write {package_json_path} error: {e}")
        sys.exit(1)

def run_command(command):
    print(f"running: {command}")
    try:
        subprocess.run(command, check=True, shell=True)
        print(f"successfully run `{command}`")
    except subprocess.CalledProcessError as err:
        print(f"failed to run {command} error: {err}")
        sys.exit(err.returncode)

def refresh_tokens(source_folder, target_folder):
    # move new token files
    old_tokens = os.listdir(source_folder)
    for old_token in old_tokens:
        # in case of the src and dst are the same file
        dst_file = os.path.join(target_folder, old_token)
        if os.path.exists(dst_file):
            os.remove(dst_file)
        shutil.move(os.path.join(source_folder, old_token), target_folder)

def main():
    parser = argparse.ArgumentParser(description="update momentum version and generate new momentumXXX.json file")
    parser.add_argument("--version", help="new momentum version")
    parser.add_argument("--platform", choices=["windows","mac"])
    parser.add_argument("--target_folder", help="target folder to refresh tokens")
    args = parser.parse_args()

    version = args.version
    platform = args.platform
    package_json_path = "package.json"
    # update version value in package_json_path
    update_version_value(package_json_path, version)

    # run npm install
    run_command("npm install")

    # npm run build:<platform>
    run_command(f"npm run build:{platform}")

    refresh_tokens("dist", args.target_folder)

main()