import argparse
import json
import subprocess
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

def run_command(command_list, description):
    print(f"running: {' '.join(command_list)}")
    try:
        subprocess.run(command_list, check=True, shell=True)
        print(f"successfully run {description}")
    except subprocess.CalledProcessError as err:
        print(f"failed to run {description} error: {err}")
        sys.exit(err.returncode)

def main():
    parser = argparse.ArgumentParser(description="update momentum version and generate new momentumXXX.json file")
    parser.add_argument("--version", help="new momentum version")
    parser.add_argument("--platform", choices=["windows","mac"])
    args = parser.parse_args()

    version = args.version
    platform = args.platform
    package_json_path = "package.json"
    # update version value in package_json_path
    update_version_value(package_json_path, version)

    # run npm install
    run_command(["npm", "install"], "npm install")

    # npm run build:<platform>
    run_command(["npm", "run", f"build:{platform}"], f"npm run build:{platform}")

main()