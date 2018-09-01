from collections import namedtuple

RegionAmiMapType = namedtuple('RegionAmiMapType', ['region_name', 'ami_id'])

RegionAmiMap = {
    "us-east-1": RegionAmiMapType(region_name="US East (N. Virginia)", ami_id="ami-1b93f264"),
    "us-east-2": RegionAmiMapType(region_name="US East (Ohio)", ami_id="ami-01b98564"),
    "us-west-1": RegionAmiMapType(region_name="US West (N. California)", ami_id="ami-983b20f8"),
    "us-west-2": RegionAmiMapType(region_name="US West (Oregon)", ami_id="ami-b9cdb4c1"),
    "ca-central-1": RegionAmiMapType(region_name="Canada (Central)", ami_id="ami-a1c744c5"),
    "eu-central-1": RegionAmiMapType(region_name="EU (Frankfurt)", ami_id="ami-daa58e31"),
    "eu-west-1": RegionAmiMapType(region_name="EU (Ireland)", ami_id="ami-0ac4fd73"),
    "eu-west-2": RegionAmiMapType(region_name="EU (London)", ami_id="ami-aefb17c9"),
    "eu-west-3": RegionAmiMapType(region_name="EU (Paris)", ami_id="ami-556edf28"),
    "ap-southeast-1": RegionAmiMapType(region_name="Asia Pacific (Singapore)", ami_id="ami-303b074c"),
    "ap-southeast-2": RegionAmiMapType(region_name="Asia Pacific (Sydney)", ami_id="ami-e6ce1d84"),
    "ap-northeast-2": RegionAmiMapType(region_name="Asia Pacific (Seoul)", ami_id="ami-f6fa5198"),
    "ap-northeast-1": RegionAmiMapType(region_name="Asia Pacific (Tokyo)", ami_id="ami-b19866ce"),
    "ap-south-1": RegionAmiMapType(region_name="Asia Pacific (Mumbai)", ami_id="ami-f3aa869c"),
    "sa-east-1": RegionAmiMapType(region_name="South America (Sao Paulo)", ami_id="ami-d02977bc"),
    "us-gov-west-1": RegionAmiMapType(region_name="AWS GovCloud (US)", ami_id="ami-03fb6a62"),
}
