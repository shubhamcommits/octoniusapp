from diagrams import Diagram, Cluster, Edge
from diagrams.aws.storage import S3
from diagrams.custom import Custom
from diagrams.generic.compute import Rack
from diagrams.generic.place import Datacenter
from diagrams.k8s.clusterconfig import HPA
from diagrams.k8s.compute import Deployment, Pod
from diagrams.k8s.controlplane import API
from diagrams.k8s.group import Namespace
from diagrams.k8s.infra import ETCD, Master, Node
from diagrams.k8s.network import Ingress, Service
from diagrams.k8s.others import CRD
from diagrams.k8s.podconfig import ConfigMap
from diagrams.k8s.storage import PV
from diagrams.onprem.certificates import CertManager, LetsEncrypt
from diagrams.onprem.client import Users
from diagrams.onprem.database import Mongodb
from diagrams.onprem.logging import Loki
from diagrams.onprem.monitoring import Grafana, Prometheus
from diagrams.onprem.network import Internet, Nginx, Traefik
from diagrams.outscale.compute import DirectConnect
from diagrams.outscale.network import LoadBalancer
from diagrams.outscale.security import Firewall
from urllib.request import urlretrieve
from diagrams.programming.language import Bash

# Download the MinIO icon image file
minio_url = "https://min.io/resources/img/logo/MINIO_wordmark.png"
minio_icon = "minio.png"  # Save the icon locally
oct_url = "https://media.licdn.com/dms/image/C4D0BAQGaCvv15a0TBw/company-logo_200_200/0/1631344610113?e=1715212800&v=beta&t=kcGtpW_48c6O_WdF9wWnckt8QZAkq3Si1QrntbN4554"
oct_icon = "octonius.png"
urlretrieve(minio_url, minio_icon)
urlretrieve(oct_url, oct_icon)
with Diagram("Hetzner Cloud Infra", show=False,direction="TB"):
    internet_traffic = DirectConnect("Internet Traffic")
    lb = LoadBalancer("Hetzner LB")
    with Cluster("Private network"):    
        with Cluster("Kubernetes"):
            with Cluster("Control Plane"):
                managers = Rack("server1")
                managers - [Rack("server2")-Rack("server3")]
                etcd = ETCD("servers")
            with Cluster("Workers nodes"):
                workers = Rack("server1")
                workers - [Rack("Server2")-Rack("serverN")]
                node = Node("servers")
            with Cluster("Autoscaled nodes"):
                scaller = Rack("server0")
                scaller - [Rack("serverN")]
                auto_scaller = Node("servers")                
        firewall = Firewall("Firewall")
    internet_traffic >> lb
    lb >> Edge(label="ports: 80,443,22")  >> managers
    lb >> workers
    lb >> auto_scaller

    provisoning =  Bash("kube-hetzner")
    etcd \
    << Edge(label="provisioning",color="darkgreen", style="bold") \
    << provisoning
    node \
    << Edge(label="provisioning",color="darkgreen", style="bold") \
    << provisoning
    auto_scaller \
    << Edge(label="provisioning",color="darkgreen", style="bold") \
    << provisoning
    etcd >> node >> etcd
    etcd >> auto_scaller >> etcd

with Diagram("Kubernetes Cluster", show=False, direction="TB"):
    ingress = Ingress("traefik") 

    metrics = Prometheus("metric")
    grafana = Grafana("monitoring")
    metrics << Edge(color="firebrick", style="dashed") << grafana
    loki = Loki("logging")
    loki << Edge(color="firebrick", style="dashed") << grafana
    with Cluster("Kubernetes"):
        
        with Cluster("Octonius Deployment"):
            apps = Custom("",oct_icon)
            with Cluster(""):
                servers = [Pod("Service1")-Edge(color="brown", style="dotted")-Pod("ServiceN")]
            ingress >> Edge(color="darkblue") >> apps \
                << Edge(label="collect") \
                << metrics
            apps \
                << Edge(label="collect") \
                << loki
        with Cluster("Minio Cluster"):
            minio = Custom("",minio_icon)
            with Cluster("Server1"):
                minio_pv = [PV("disk1")-Edge(color="brown", style="dotted")-PV("disk2")-Edge(color="brown", style="dotted")-PV("disk3")] 
            with Cluster("Server2"):
                minio_pv1 = [PV("disk1")-Edge(color="brown", style="dotted")-PV("disk2")-Edge(color="brown", style="dotted")-PV("disk3")]                 
            with Cluster("Server3"):
                minio_pv = [PV("disk1")-Edge(color="brown", style="dotted")-PV("disk2")-Edge(color="brown", style="dotted")-PV("disk3")]          
            minio \
                - Edge(color="brown", style="dotted") \
                << Edge(label="collect") \
                << metrics
            ingress >> Edge(color="darkblue") >> minio
            apps >> Edge(color="darkorange") >> minio >> Edge(color="darkorange") >> apps

        with Cluster("Mongodb"):
            mongo_cl = Mongodb("")
            with Cluster("replica1"):
                mongo = PV("Persistant Storage")
            with Cluster("replica2"):                
                mongo1 = PV("Persistant Storage")
            with Cluster("replica3"):    
                mongo2 = PV("Persistant Storage")      
            apps >> Edge(color="darkgreen") >> mongo_cl >> Edge(color="darkgreen") >> apps
            mongo \
                - Edge(color="brown", style="dotted") \
                - mongo1 \
                - Edge(color="brown", style="dotted") \
                - mongo2 \
                << Edge(label="collect") \
                << metrics
        backup = Pod("Backup")
        mongo_cl >> backup >> S3("AWS S3")
        keel_sh = Pod("keel.sh")
        keel_sh >> Edge(color="dark-red",style="dotted", label="Update Deployment")>> apps
        cert_manager = CertManager("Certificate Manager")
        lets = LetsEncrypt("Lets Encrypt")
        cert_manager \
            >> Edge(color="darkviolet",style="dotted") \
            >> ingress
        cert_manager \
            >> Edge(color="darkviolet",style="dotted") \
            >> minio
        cert_manager \
            >> Edge(color="darkviolet",style="dotted") \
            >> lets
        lets \
            >> Edge(color="darkviolet",style="dotted") \
            >> cert_manager
        
with Diagram("Cert-Manager in Kubernetes", show=False):
    lets = LetsEncrypt("Lets Encrypt")
    with Cluster("Kubernetes Cluster"):
        ingress = Traefik("Traefik")
        minio = Custom("Minio",minio_icon)
        with Cluster("Cert-Manager"):
            certmanager = CertManager("CA")
            with Cluster("Let's Encrypt"):
                cluster_issuer = ConfigMap("Cluster Issuer")
            with Cluster("Minio Certificate"):
                minio_cert = ConfigMap("Minio Certificate")
                minio_cert -Edge(color="darkviolet",style="dotted") -  cluster_issuer
                minio_cert - Edge(color="darkviolet",style="dotted")-  certmanager
            cluster_issuer - Edge(color="darkviolet",style="dotted") - certmanager
        minio << Edge(color="darkviolet",style="dotted",label="mTLS") << minio_cert
        ingress << cluster_issuer
        lets << cluster_issuer << lets
        ingress >> Edge(color="darkviolet",style="dotted") >> minio >> Edge(color="darkviolet",style="dotted") >> ingress
    users = Users("Users")
    users >> ingress >> users


with Diagram("MongoDB Operator in Kubernetes", show=False):
    with Cluster("Kubernetes"):
        operator = CRD("k8s custom resources")
        
        with Cluster("MongoDB"):
            mongodb_cluster = [Mongodb("MongoDB Replica"), Mongodb("MongoDB Replica")]
            deploy = Deployment("Mongodb Operator")
            operator << deploy >> mongodb_cluster