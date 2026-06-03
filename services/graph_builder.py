# Mohid Umer, M Ahsan, M Saim
# 23i-2130, 23i-2117, 23i-2119
# graph_builder.py

"""Graph Builder Service for Threat Relationship Mapping"""
import networkx as nx
from datetime import datetime, timedelta
from typing import Dict, List, Any

class GraphBuilder:
    def __init__(self):
        self.graph = nx.Graph()
        self.node_attributes = {}
        self.edge_weights = {}
    
    def add_ioc(self, ioc_value: str, ioc_type: str, metadata: Dict = None):
        """Add an IOC node to the graph"""
        if not self.graph.has_node(ioc_value):
            self.graph.add_node(ioc_value, type=ioc_type, first_seen=datetime.utcnow())
            self.node_attributes[ioc_value] = metadata or {}
        
        # Update last seen
        self.graph.nodes[ioc_value]['last_seen'] = datetime.utcnow()
        if metadata:
            self.node_attributes[ioc_value].update(metadata)
    
    def add_relationship(self, ioc1: str, ioc2: str, relationship_type: str = 'related_to', weight: float = 1.0):
        """Add a relationship edge between two IOCs"""
        if self.graph.has_node(ioc1) and self.graph.has_node(ioc2):
            self.graph.add_edge(ioc1, ioc2, 
                              relationship=relationship_type, 
                              weight=weight,
                              created_at=datetime.utcnow())
            self.edge_weights[(ioc1, ioc2)] = weight
    
    def find_connected_iocs(self, ioc_value: str, max_depth: int = 2) -> List[str]:
        """Find all IOCs connected to a given IOC within max_depth hops"""
        if not self.graph.has_node(ioc_value):
            return []
        
        connected = []
        visited = set()
        queue = [(ioc_value, 0)]
        
        while queue:
            current, depth = queue.pop(0)
            if current in visited or depth > max_depth:
                continue
            
            visited.add(current)
            if current != ioc_value:
                connected.append(current)
            
            if depth < max_depth:
                for neighbor in self.graph.neighbors(current):
                    if neighbor not in visited:
                        queue.append((neighbor, depth + 1))
        
        return connected
    
    def get_central_nodes(self, top_n: int = 10) -> List[Dict]:
        """Get the most connected IOCs (central nodes)"""
        if len(self.graph.nodes()) == 0:
            return []
        
        centrality = nx.degree_centrality(self.graph)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:top_n]
        
        return [
            {
                'ioc': node,
                'centrality': score,
                'connections': self.graph.degree(node),
                'type': self.graph.nodes[node].get('type', 'unknown')
            }
            for node, score in sorted_nodes
        ]
    
    def detect_communities(self) -> List[List[str]]:
        """Detect communities/clusters of related IOCs"""
        if len(self.graph.nodes()) < 2:
            return []
        
        try:
            from networkx.algorithms import community
            communities = community.greedy_modularity_communities(self.graph)
            return [list(comm) for comm in communities]
        except:
            # Fallback: connected components
            return [list(comp) for comp in nx.connected_components(self.graph)]
    
    def time_decay_edges(self, decay_days: int = 7):
        """Apply time decay to edge weights based on age"""
        current_time = datetime.utcnow()
        edges_to_remove = []
        
        for u, v, data in self.graph.edges(data=True):
            created_at = data.get('created_at')
            if created_at:
                age_days = (current_time - created_at).days
                if age_days > decay_days:
                    edges_to_remove.append((u, v))
        
        for u, v in edges_to_remove:
            self.graph.remove_edge(u, v)
    
    def export_graph_json(self) -> Dict:
        """Export graph as JSON for visualization"""
        nodes = []
        edges = []
        
        for node, data in self.graph.nodes(data=True):
            nodes.append({
                'id': node,
                'type': data.get('type', 'unknown'),
                'first_seen': data.get('first_seen', datetime.utcnow()).isoformat() if isinstance(data.get('first_seen'), datetime) else str(data.get('first_seen')),
                'last_seen': data.get('last_seen', datetime.utcnow()).isoformat() if isinstance(data.get('last_seen'), datetime) else str(data.get('last_seen')),
                'attributes': self.node_attributes.get(node, {})
            })
        
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                'source': u,
                'target': v,
                'relationship': data.get('relationship', 'related_to'),
                'weight': data.get('weight', 1.0)
            })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'stats': {
                'node_count': len(nodes),
                'edge_count': len(edges),
                'density': nx.density(self.graph) if len(nodes) > 1 else 0
            }
        }
