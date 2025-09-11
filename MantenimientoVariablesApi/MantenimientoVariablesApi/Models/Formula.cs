namespace MantenimientoVariablesApi.Models
{
    public class Formula
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? OriginalFormula { get; set; }
        public double? Result { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}